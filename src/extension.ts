import * as vscode from 'vscode';
import { FASTBuildTaskProvider } from './FASTBuildTaskProvider';

let fbuildTaskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
	fbuildTaskProvider = vscode.tasks.registerTaskProvider(FASTBuildTaskProvider.FASTBuildType, new FASTBuildTaskProvider());
}

export function deactivate(): void {
	if (fbuildTaskProvider) {
		fbuildTaskProvider.dispose();
	}
}