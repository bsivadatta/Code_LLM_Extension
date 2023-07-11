// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { WebSocket } from 'ws';

import axios from 'axios';


async function makeAPICall(line: string): Promise<any> {
  const url = 'http://127.0.0.1:8000/suggestion/';
  const requestData = {
    prompt: line
  };

  try {
    const response = await axios.post(url, requestData);
    return response;
  } catch (error) {
    console.error('makeAPI call error:', error);
    throw error
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "ocp" is now active!');

  let disposable: vscode.Disposable | undefined;
	disposable = vscode.commands.registerCommand('ocp.suggest', () => {
		let flag = false;
    vscode.window.showInformationMessage('Code suggestions activated.');
		let provider: vscode.InlineCompletionItemProvider = {
      async provideInlineCompletionItems(document, position, context, token) {
        if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic){
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
          let start = String(document.lineAt(position.line).text.length);
          let end = String(document.lineAt(position.line).text.length);
           
          offset++;
          const startInt = parseInt(start, 10);
          const endInt =
              end === '*'
                ? document.lineAt(position.line).text.length
                : parseInt(end, 10);
          
          let code_context = document.getText(new Range(0, 0, document.lineCount, 0));
          // let code_context = ""
          // if (position.line > 1){
          //   code_context = document.getText(new Range(0, 0, position.line - 2, 0));
          // }
          // code_context = code_context + document.getText(new Range(position.line + 1, 0, document.lineCount, 0))
          //let code_context = document.getText(new Range(position.line + 1, 0, document.lineCount, 0))
          
          console.log('provideInlineCompletionItems triggered');
          console.log(document.languageId)
          let post_string = document.languageId + ":::" + code_context
          let counter = position.line + 2;

          axios({
            method: 'post',
            url: 'http://scaoda9l009.us.oracle.com:8008/test', // Replace with the appropriate URL
            //url: 'http://127.0.0.1:9999/test', // Replace with the appropriate URL
            //url: 'http://10.32.251.127:9999/test', // Replace with the appropriate URL
            data: post_string,
            responseType: 'stream',
          })
            .then(response => {
              response.data.on('data', (chunk: Buffer) => {
                const chunkString: string = chunk.toString('utf-8');
                // Handle the received video chunk as a 
                vscode.window.activeTextEditor?.edit(async (editBuilder) => {
                  const startPosition = new vscode.Position(position.line + counter, startInt);
                  const endPosition = new vscode.Position(position.line + counter, endInt);
                  const range = new vscode.Range(startPosition, endPosition);
                  
                  if (counter > position.line){ editBuilder.replace(range, chunkString);}
                  //editBuilder.replace(range, line);
                  const rawLine = JSON.stringify(chunkString, (key, value) =>
                    typeof value === 'string' ? value.replace(/\n/g, '\\n').replace(/\r/g, '\\r') : value
                  );
    
                  //console.log(rawLine);
                  if (rawLine.includes("\\n")) {
                    counter = counter + 1;
                  }
                  if (chunkString == "some fake video bytes"){
                    counter = counter + 1;
                    
                  }
                  //await sleep(2000);
                  });
                 // or do something else with the string data
              });

              response.data.on('end', () => {
                // Streaming complete
                vscode.window.showInformationMessage('Code suggestion completed.');
                console.log('Streaming complete');
              });
            })
            .catch(error => {
              // Handle the error
              console.error(error);
            });

          // const socket = new WebSocket('ws://localhost:9999/stream');
          
          // socket.onopen = () => {
          //   socket.send(code_context + '\n' + lineBefore);
          // };

          // socket.onmessage = (event) => {
          //   // Introduce a delay of 1 second (1000 milliseconds)
          //   setTimeout(() => {
          //     const line = event.data.toString(); // Convert Buffer to string
          //     // Process the line and send it to 
          //     console.log("sibudara");
          //     //process.stdout.write(line);
          //     console.log(line);
          //     //if (line[0] === '"' && line[line.length - 1] === '"') {
          //     vscode.window.activeTextEditor?.edit((editBuilder) => {
          //     const startPosition = new vscode.Position(position.line + counter, startInt);
          //     const endPosition = new vscode.Position(position.line + counter, endInt);
          //     const range = new vscode.Range(startPosition, endPosition);
          //     if (counter > position.line){ editBuilder.replace(range, line);}
          //     //editBuilder.replace(range, line);
          //     const rawLine = JSON.stringify(line, (key, value) =>
          //       typeof value === 'string' ? value.replace(/\n/g, '\\n').replace(/\r/g, '\\r') : value
          //     );

          //     //console.log(rawLine);
          //     if (rawLine.includes("\\n")) {
          //       counter = counter + 1
          //     }
              
          //     });
          //   //}
          //   }, 0.001);
          // };
        
          // vscode.window.showInformationMessage('Generating suggestion');
          // let suggestion = await callApi(lineBefore);
          // result.items.push(
          //   {
          //     //insertText: (await makeAPICall(code_context + '\n' + lineBefore)).data.suggestion,
          //     insertText: "hello",
          //     range: new Range(position.line, startInt, position.line, endInt)
          //   }
          // );
          flag = true;
          vscode.window.showInformationMessage('Generating suggestion...');
          return result;
        }}
      }
    };
    
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

	});


  let disposable2 = vscode.commands.registerCommand('ocp.trial', () => {
		vscode.window.showInformationMessage('Trial Activated');
    axios({
        method: 'get',
        //url: 'http://scaoda9l009.us.oracle.com:8008/test', // Replace with the appropriate URL
        url: 'http://127.0.0.1:9999/stop', // Replace with the appropriate URL
        //url: 'http://10.32.251.127:9999/test', // Replace with the appropriate URL
        responseType: 'text',
      })
        .then(response => {
          response.data.on('data', (chunk: Buffer) => {
             // or do something else with the string data
          });

          response.data.on('end', () => {
            // Streaming complete
            vscode.window.showInformationMessage('Stopping completed.');
            console.log('Stopping complete');
          });
        })
        .catch(error => {
          // Handle the error
          console.error(error);
        });


	});
	context.subscriptions.push(disposable);	
}

// This method is called when your extension is deactivated
export function deactivate() {}
function setStream(arg0: (prevStream: any) => any) {
  throw new Error('Function not implemented.');
}

