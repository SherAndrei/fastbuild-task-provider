import * as path from 'path';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import { platform } from 'os';

let _channel: vscode.OutputChannel;
function getOutputChannel(): vscode.OutputChannel {
	if (!_channel) {
		_channel = vscode.window.createOutputChannel('FASTBuild Task Detection');
	}
	return _channel;
}


function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string }> {
	return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
		cp.exec(command, options, (error, stdout, stderr) => {
			if (error) {
				reject({ error, stdout, stderr });
			}
			resolve({ stdout, stderr });
		});
	});
}

interface FASTBuildTaskDefinition extends vscode.TaskDefinition {
	task: string;
}

function isTestTask(name: string): boolean {
	return name.startsWith('Test-');
}

export class FASTBuildTaskProvider implements vscode.TaskProvider {
	static FASTBuildType = 'FASTBuild';
	private executablePath: vscode.ShellQuotedString = {
		value: '',
		quoting: vscode.ShellQuoting.Weak
	};
	private executableArgs: string[];

	private getOS(): string {
		switch (platform()) {
		  case 'win32':
			return 'windows';
		  default:
			return 'linux';
		}
	}

	constructor() {
		const config = vscode.workspace.getConfiguration('fastbuild-task-provider');
		const executablePath = config.get(`path.${this.getOS()}`);
		if (typeof executablePath === "string") {
			this.executablePath.value = executablePath.trim();
		} else {
			getOutputChannel().appendLine("Passed path is not a string, defaulting to \"fbuild\"\n");
			getOutputChannel().show(true);
			this.executablePath.value = 'fbuild';
		}
		let executableArgs = config.get('args');
		if (Array.isArray(executableArgs) && executableArgs.every(element => typeof element === "string")) {
			this.executableArgs = executableArgs;
		} else {
			getOutputChannel().appendLine("Passed args are not array of strings, defaulting to []\n");
			getOutputChannel().show(true);
			this.executableArgs = [];
		}
	}

	public provideTasks(): Thenable<vscode.Task[]> | undefined {
		if (this.executablePath) {
			return this.getFASTBuildTasks();
		}
		return undefined;
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const task = _task.definition.task;
		if (task) {
			const definition: FASTBuildTaskDefinition = <any>_task.definition;
			return new vscode.Task(
				definition,
				_task.scope ?? vscode.TaskScope.Workspace,
				definition.task,
				FASTBuildTaskProvider.FASTBuildType,
				new vscode.ShellExecution(
					this.executablePath,
					[...this.executableArgs, definition.task]
				)
			);
		}
		return undefined;
	}

	private async getFASTBuildTasks(): Promise<vscode.Task[]> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		const result: vscode.Task[] = [];
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return result;
		}
		const workspaceFolder = workspaceFolders[0];
		const workspaceFolderVar = "${workspaceFolder}";
		const folderString = workspaceFolder.uri.fsPath;
		let commandLine = `${this.executablePath.value} -showtargets`;
		// NB: because `cwd` in `exec` is already workspace folder
		commandLine = commandLine.replace(workspaceFolderVar, ".");
		try {
			const { stdout, stderr } = await exec(commandLine, { cwd: folderString });
			if (stderr && stderr.length > 0) {
				getOutputChannel().appendLine(stderr);
				getOutputChannel().show(true);
			}
			if (stdout) {
				const lines = stdout.split(/\r{0,1}\n/);
				for (let line of lines) {
					if (line.length === 0) {
						continue;
					}
					if (!line.startsWith('\t')) {
						continue;
					}
					const taskName = line.trim();
					const kind: FASTBuildTaskDefinition = {
						type: FASTBuildTaskProvider.FASTBuildType,
						task: taskName
					};
					const task = new vscode.Task(
						kind,
						workspaceFolder,
						taskName,
						FASTBuildTaskProvider.FASTBuildType,
						new vscode.ShellExecution(
							this.executablePath,
							[...this.executableArgs, taskName]
						));
					task.group = isTestTask(taskName)
						? vscode.TaskGroup.Test
						: vscode.TaskGroup.Build;
					result.push(task);
				}
			}
		} catch (err: any) {
			const channel = getOutputChannel();
			if (err.stderr) {
				channel.appendLine(err.stderr);
			}
			if (err.stdout) {
				channel.appendLine(err.stdout);
			}
			channel.appendLine('Auto detecting fbuild tasks failed.');
			channel.show(true);
		}
		return result;
	}
}

