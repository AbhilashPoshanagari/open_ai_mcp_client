import{j as p,q as a}from"./chunk-FT3LMQJV.js";import{a as u,i as o,pg as c}from"./chunk-PR3HXOEE.js";var _=`You are given the below API Documentation:
{api_docs}
Using this documentation, generate the full API url to call for answering the user question.
You should build the API url in order to get a response that is as short as possible, while still getting the necessary information to answer the question. Pay attention to deliberately exclude any unnecessary pieces of data in the API call.

Question:{question}
API url:`,P=new p({inputVariables:["api_docs","question"],template:_}),A=`${_} {api_url}

Here is the response from the API:

{api_response}

Summarize this response to answer the original question.

Summary:`,w=new p({inputVariables:["api_docs","question","api_url","api_response"],template:A});var E=class l extends c{apiAnswerChain;apiRequestChain;apiDocs;headers={};inputKey="question";outputKey="output";get inputKeys(){return[this.inputKey]}get outputKeys(){return[this.outputKey]}constructor(e){super(e),this.apiRequestChain=e.apiRequestChain,this.apiAnswerChain=e.apiAnswerChain,this.apiDocs=e.apiDocs,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.headers=e.headers??this.headers}_call(e,i){return o(this,null,function*(){let t=e[this.inputKey],s=yield this.apiRequestChain.predict({question:t,api_docs:this.apiDocs},i?.getChild("request")),n=yield(yield fetch(s,{headers:this.headers})).text(),r=yield this.apiAnswerChain.predict({question:t,api_docs:this.apiDocs,api_url:s,api_response:n},i?.getChild("response"));return{[this.outputKey]:r}})}_chainType(){return"api_chain"}static deserialize(e){return o(this,null,function*(){let{api_request_chain:i,api_answer_chain:t,api_docs:s}=e;if(!i)throw new Error("LLMChain must have api_request_chain");if(!t)throw new Error("LLMChain must have api_answer_chain");if(!s)throw new Error("LLMChain must have api_docs");return new l({apiAnswerChain:yield a.deserialize(t),apiRequestChain:yield a.deserialize(i),apiDocs:s})})}serialize(){return{_type:this._chainType(),api_answer_chain:this.apiAnswerChain.serialize(),api_request_chain:this.apiRequestChain.serialize(),api_docs:this.apiDocs}}static fromLLMAndAPIDocs(e,i,t={}){let{apiUrlPrompt:s=P,apiResponsePrompt:h=w}=t,n=new a({prompt:s,llm:e}),r=new a({prompt:h,llm:e});return new this(u({apiAnswerChain:r,apiRequestChain:n,apiDocs:i},t))}};export{E as APIChain};
