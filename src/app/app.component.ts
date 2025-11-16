import { Component, ChangeDetectorRef, inject, model, signal, ChangeDetectionStrategy, ViewChild } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { McpService } from './services/mcp.service';
import { InputBoxComponent } from './components/input-box/input-box.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { OpenAiService } from './services/open-ai.service';
import { McpClientComponent } from './mcp-client/mcp-client.component';
import { NamedItem, OpenAIFunctions } from './common';
import { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { ElicitationComponent } from './components/elicitation/elicitation.component';
import { McpElicitationService } from './services/mcp/mcp-elicitation.service';
import { DomainDialogComponent } from './components/domain-dialog/domain-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from './services/storage.service';
import { OpenAITool } from './constants/toolschema';
interface DialogData {
  page: string;
  server: string;
  open_ai_token: string;
}
@Component({
  selector: 'app-root',
  imports: [InputBoxComponent, ChatbotComponent, SidebarComponent, MatSidenavModule, McpClientComponent,
    MatButtonModule, MatIconModule, MatToolbarModule, MatListModule, ElicitationComponent],
  standalone: true,
  providers: [McpService, McpElicitationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class AppComponent {
  @ViewChild('chatComponent') chatComponent!: ChatbotComponent;
  messages: any[] = [];
  title = 'AI powered chatbot';
  isSidebarOpen = true;
  chatMessages: any[] = [
    { sender: 'bot', content: 'Hello! How can I assist you today?', timestamp: new Date() }
  ];
  opentAI_functions: OpenAIFunctions[] | undefined;
  llm_model: any;
  llm_with_tools: any;
  errorMessage: string = '';
  system_prompt: string = '';
  human_prompt: string = '';
  llm_runnable: any;
  selectedTool: NamedItem | null = null;
  streamingContent: string = '';
  readonly page = signal('');
  readonly openAiKey = model('');
  readonly dialog = inject(MatDialog);

  constructor(private mcpService: McpService, private openAIService: OpenAiService, 
    private storageService: StorageService,
    private mcpElicitationService: McpElicitationService, private cdr: ChangeDetectorRef) {
    this.mcpService.mcpServerInstructions$.subscribe((res) => {
    this.system_prompt = res ? res: "You are a helpful assistant. Use tools *only* when needed. \
        If you already have the answer, reply normally instead of calling a tool again.";
    })
    this.mcpService.streaming$.subscribe((stream: any) => {
        if(stream.status && stream.status === "completed"){
          // Handle completed status if needed
          this.streamingContent += stream.message;
          const lastIndex = this.chatMessages.length - 1;
          this.chatMessages[lastIndex] = this.checkToolCall(this.streamingContent);
          this.cdr.detectChanges();
          this.streamingContent = '';
          setTimeout(() => {
              this.chatComponent.scrollToBottom(true); // Force scroll
            }, 0);
        }
        else if(stream.status && stream.status === "started"){
          this.streamingContent += stream.message;
          this.chatMessages.push({sender: 'bot', content: this.streamingContent, timestamp: new Date()});
          // Use setTimeout to ensure DOM is updated before scrolling
            setTimeout(() => {
              this.chatComponent.scrollToBottom(); // Force scroll
            }, 0);
        }
        else if(stream.status && stream.status === "in_progress"){
          this.streamingContent += stream.message;
          const lastIndex = this.chatMessages.length - 1;
          this.chatMessages[lastIndex].content = this.streamingContent;
          this.cdr.detectChanges();
            setTimeout(() => {
              this.chatComponent.scrollToBottom(true); // Force scroll
            }, 0);
        }else {

        }
      });
    this.human_prompt = "{input}";
    // Initialize with stored token or empty string
    const storedToken = this.storageService.getValueFromKey('open_ai_token') || '';
    this.openAiKey.set(storedToken);
    // Check if we need to show dialog (no token exists)
    if (!storedToken) {
      // Use setTimeout to ensure component is fully initialized
    } else {
      // Only initialize OpenAI if we have a token
      this.InitializeLLM(storedToken);
    }
  }

  checkToolCall(streamingContent: string){
    let final_response: {sender: string,
          content: string,
          layouts?: any,
          timestamp: Date} = {
                              sender: "bot",
                              content: streamingContent,
                              timestamp: new Date()
                            }
    try {
      const jsonFormat = JSON.parse(streamingContent);
      const server_keys = Object.keys(jsonFormat);
      if(server_keys.includes("name") && server_keys.includes("arguments")){
        if(jsonFormat.name === "table_layout_tool"){
            const layouts = [{
                layout_name: "table",
                tables: [jsonFormat.arguments]
              }]
            final_response = {
                sender: "bot",
                content: "",
                layouts: layouts,
                timestamp: new Date()
              }
            }
            else {

            }
          }
      else {
          }
      return final_response;
    } catch (error) {
      return final_response;
    }    
  }

  InitializeLLM(token: string, tools: OpenAITool[] = []){
        // this.openAIService.getOpenAIFunctions(token).subscribe(result => {
        //   if (result.status === 200) {
        // console.log("System prompt : ", this.system_prompt);
        this.llm_model = this.openAIService.getOpenAiClient(token)  
        if (tools.length > 0){
            try {
                this.llm_with_tools = this.openAIService.openAImodels("langchain", 
                this.llm_model,
                tools,
                this.system_prompt,
                this.human_prompt
                );
                this.llm_runnable = RunnableSequence.from([
                        this.llm_with_tools.overall_prompt,
                        this.llm_with_tools.model_with_tools
                      ]);

              } catch (error) {
                
              }
          } else {
            // this.errorMessage = result.message;
            // console.error('Error loading OpenAI functions:', result.message);
                this.llm_with_tools = this.openAIService.openAImodels("langchain", 
                this.llm_model,
                [],
                this.system_prompt,
                this.human_prompt
                );
                this.llm_runnable = RunnableSequence.from([
                        this.llm_with_tools.overall_prompt,
                        this.llm_with_tools.model_with_out_tools
                      ]);
          }
        // });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

// appendMessages(messages: any){
//   this.chatMessages.push({ sender: 'bot', 
//       content: messages,
//       timestamp: new Date() });
// }
toolsList(tools: OpenAITool[]){
  this.InitializeLLM(this.openAiKey(), tools)
}

testTool(tool: NamedItem | null){
  if(tool){
    this.selectedTool = tool;
    this.mcpElicitationService.createFormFromSchema(tool.inputSchema, "Tool test")
  }else {
    this.selectedTool = null;
  }
  
}

tool_response(form: {response: string, layouts?: any}){
  this.chatMessages.push({
          sender: 'bot',
          content: form.response,
          layouts: form.layouts,
          timestamp: new Date()
        });
  setTimeout(() => {
    this.chatComponent.scrollToBottom(true); // Force scroll
  }, 0);
}

tool_request(form: {request: string}){
  this.chatMessages.push({
        sender: 'user',
        content: form.request,
        timestamp: new Date()
      });
}

async agentWorkflow(userInput: string) {
  let processedText = '';
  let fullChunk: AIMessageChunk | null = null;
  const inputMessages: any[] = [{ role: 'user', content: userInput }];
  const usedTools = new Set<string>();

  this.chatMessages.push({ sender: 'user', content: userInput, timestamp: new Date() });

  try {
    let continueLoop = true;
    let iteration = 0;

    while (continueLoop && iteration < 8) { // safety limit
      iteration++;
      const stream = await this.llm_runnable.stream({ input: inputMessages });

      fullChunk = null;
      this.chatMessages.push({ sender: 'bot', content: '', timestamp: new Date() });

      for await (const chunk of stream) {
        if (chunk instanceof AIMessageChunk) {
          fullChunk = fullChunk ? fullChunk.concat(chunk) : chunk;
          const lastIndex = this.chatMessages.length - 1;
          this.chatMessages[lastIndex].content = fullChunk.content;
          this.cdr.detectChanges();
          setTimeout(() => {
              this.chatComponent.scrollToBottom(true); // Force scroll
            }, 0);
        }
      }

      // Check for tool calls
      const toolCalls = fullChunk?.tool_calls ?? [];

      if (toolCalls.length === 0) {
        // No more tools → stop loop
        continueLoop = false;
        break;
      }

      // Process tools once per iteration
      for (const toolCall of toolCalls) {
        const toolName = toolCall.name;
        const toolArgs = toolCall.args;

        // Avoid repeating same tool
        if (usedTools.has(toolName)) {
          console.warn(`Skipping repeated tool: ${toolName}`);
          continueLoop = false;
          break;
        }
        usedTools.add(toolName);

        // Call MCP tool
        const ragResponse = await this.mcpService.callTool(toolName, toolArgs);

        const toolOutput = Array.isArray(ragResponse?.content)
          ? ragResponse.content.map((c: { type: string; text: string }) => c.text).join('\n')
          : JSON.stringify(ragResponse);

        if(ragResponse.layouts){
          this.chatMessages.push({
            sender: 'bot',
            content: toolOutput,
            layout: ragResponse.layouts,
            timestamp: new Date(),
          });
        }else {
          this.chatMessages.push({
            sender: 'bot',
            content: toolOutput,
            timestamp: new Date(),
          });
        }


        // Add tool call + output back to LLM context
        inputMessages.push({
          role: 'assistant',
          type: 'function_call',
          id: toolCall.id,
          name: toolName,
          arguments: JSON.stringify(toolArgs),
        });

        inputMessages.push({
          role: 'tool',
          type: 'function_call_output',
          id: toolCall.id,
          output: toolOutput,
        });
      }
      console.log("input messages : ", inputMessages);
    }

  } catch (error) {
    console.error("Agent workflow error:", error);
    this.chatMessages.push({
      sender: 'bot',
      content: 'Sorry, something went wrong while processing your request.',
      timestamp: new Date(),
    });
    setTimeout(() => {
      this.chatComponent.scrollToBottom(true); // Force scroll
    }, 0);
  }
}

}
