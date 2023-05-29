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

	console.log('Congratulations, your extension "ocp" is now active!');

  let disposable: vscode.Disposable | undefined;
	disposable = vscode.commands.registerCommand('ocp.suggest', () => {
		let flag = false;
		vscode.window.showInformationMessage('Press Tab to has fill suggestion');
		let provider: vscode.InlineCompletionItemProvider = {
      async provideInlineCompletionItems(document, position, context, token) {
        if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic){
        console.log('provideInlineCompletionItems triggered');
        //const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
        const regexp = /def\s+\w+\s*\([^)]*\)\s*:/;
        if (position.line <= 0 || flag) {
          return;
        }
        flag = true;
        const result: vscode.InlineCompletionList = {
          items: []
        };
        
        let offset = 1;
			  while (true) {
				  if (position.line - offset < 0) {
					  break;
				  }
          const lineComment = document.lineAt(position.line - offset - 1).text;
          const lineFunction = document.lineAt(position.line - offset).text;
          const matches2 = lineFunction.match(regexp);
          const lineBefore = lineComment + "\n" + lineFunction
          console.log('sibudara');
          console.log(matches2);
          let start = '0';
          let end = String(document.lineAt(position.line).text.length);
          if (matches2) {
            end = String(matches2['index']);
            console.log('sibudara');
            console.log(start);
            console.log('sibudara');
            console.log(end);
            console.log('sibudara');
          }
          // } else {
          //   return result;
          // }
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
          
          let suggestion = await callApi(code_context + '\n' + lineBefore);
          // let suggestion = await callApi(lineBefore);
          result.items.push(
            {
              insertText: suggestion,
              range: new Range(position.line, startInt, position.line, endInt)
            }
          );
          flag = true;
          return result;
        }}
      }
    };
    
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

	});


  let disposable2 = vscode.commands.registerCommand('ocp.trial', () => {
		let provider: vscode.InlineCompletionItemProvider = {
      async provideInlineCompletionItems(document, position, context, token) {
        if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic){
        console.log('cmd 2 triggered');
        if (position.line <= 0) {
          return;
        }
        const result: vscode.InlineCompletionList = {
          items: []
        };
        
        let offset = 1;
			  while (true) {
				  if (position.line - offset < 0) {
					  break;
				  }
          
          let start = '0';
          let end = String(document.lineAt(position.line).text.length);
          
          offset++;
          const startInt = parseInt(start, 10);
          const endInt =
              end === '*'
                ? document.lineAt(position.line).text.length
                : parseInt(end, 10);
          
          
          let suggestion = "here here"
          // let suggestion = await callApi(lineBefore);
          result.items.push(
            {
              insertText: suggestion,
              range: new Range(position.line, startInt, position.line, endInt)
            }
          );
          return result;
        }}
      }
    };
    
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

	});
	context.subscriptions.push(disposable);	
}

// This method is called when your extension is deactivated
export function deactivate() {}
