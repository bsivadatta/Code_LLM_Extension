// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import * as http from 'http';

import axios from 'axios';


async function makeAPICall(line: string): Promise<string> {
  const url = 'http://127.0.0.1:8000/suggestion/';

  const requestData = {
    suggestion: line
  };

  try {
    const response = await axios.post(url, requestData);
    return response.data.suggestion;
  } catch (error) {
    console.error('makeAPI call error:', error);
    throw error
  };
}

async function callApi(line: string): Promise<string> {
  try {
    const response = await makeAPICall(line);
    // Process the response data here
    return response;
  } catch (error) {
    // Handle any errors that occurred during the API call
    console.error('callAPI call error:', error);
  }
  return "";
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ocp" is now active!');


	// vscode.languages.registerHoverProvider(
	// 	'python',
	// 	new (class implements vscode.HoverProvider {
	// 	  provideHover(
	// 		_document: vscode.TextDocument,
	// 		_position: vscode.Position,
	// 		_token: vscode.CancellationToken
	// 	  ): vscode.ProviderResult<vscode.Hover> {
	// 		const commentCommandUri = vscode.Uri.parse(`command:ocp.suggest`);
	// 		const contents = new vscode.MarkdownString(`[Suggest Code](${commentCommandUri})`);
	
	// 		// To enable command URIs in Markdown content, you must set the `isTrusted` flag.
	// 		// When creating trusted Markdown string, make sure to properly sanitize all the
	// 		// input content so that only expected command URIs can be executed
	// 		contents.isTrusted = true;
	
	// 		return new vscode.Hover(contents);
	// 	  }
	// 	})()
	// );

	let disposable = vscode.commands.registerCommand('ocp.suggest', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Press Tab to has fill suggestion');
		const provider: vscode.InlineCompletionItemProvider = {
      async provideInlineCompletionItems(document, position, context, token) {
        console.log('provideInlineCompletionItems triggered');
        const regexp = /<suggest>\s*/;
        if (position.line <= 0) {
          return;
        }
        const result: vscode.InlineCompletionList = {
          items: []
        };
        
        let offset = 1;
			  while (offset > 0) {
				  if (position.line - offset < 0) {
					  break;
				  }
          const lineBefore = document.lineAt(position.line - offset).text;
          const matches = lineBefore.match(regexp);

          let start = '0';
          let end = '80';
          if (matches) {
            end = String(matches['index']);
          } else {
            return result;
          }
          offset++;
          const startInt = parseInt(start, 10);
          const endInt =
              end === '*'
                ? document.lineAt(position.line).text.length
                : parseInt(end, 10);
          
          //let code_context = document.getText(new Range(0, 0, document.lineCount, 0));
          let code_context = ""
          if (position.line > 1){
            code_context = document.getText(new Range(0, 0, position.line - 2, 0));
          }
          code_context = code_context + document.getText(new Range(position.line + 1, 0, document.lineCount, 0))
          console.log(code_context)
          //console.log(document.getText(new Range(0, 0, document.lineCount, document.lineAt(document.lineCount).text.length)))
          let suggestion = await callApi(code_context + '\n' +lineBefore.slice(0, endInt));
          result.items.push(
            {
              insertText: suggestion,
              range: new Range(position.line, startInt, position.line, endInt)
            }
          );
          return result;
        }
      }
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
	});


	context.subscriptions.push(disposable);	
}

// This method is called when your extension is deactivated
export function deactivate() {}
