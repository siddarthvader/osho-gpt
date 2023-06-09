import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { SupabaseHybridSearch } from 'langchain/retrievers/supabase';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { CallbackManager } from 'langchain/callbacks';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { supabase_client, dbConfig } from '$lib/helpers/config';
import { loadQAMapReduceChain } from 'langchain/chains';

import { HumanChatMessage, AIChatMessage } from 'langchain/schema';
import { HumanMessagePromptTemplate } from 'langchain/prompts';

import { config } from 'dotenv';

config();

function historyToTemplates(history = []) {
	return (
		history.length > 3 ? history.slice(history.length - 3, history.length) || [] : history || []
	).map((message) => {
		if (message.type === 'userMessage') {
			return new HumanChatMessage(message.message);
		} else {
			return new AIChatMessage(message.message);
		}
	});
}

export const makeChain = async (question, history = []) => {
	// console.log({ history })
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writable = stream.writable;
	const writer = writable.getWriter();

	const embeddings = new OpenAIEmbeddings({
		// verbose: true,
	});

	/* create vectorstore*/
	const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, dbConfig);

	// const retriever = getReteiever(embeddings);

	const llm = new OpenAI({
		temperature: 0,
		streaming: true,
		modelName: 'gpt-3.5-turbo',
		callbackManager: llmCallback(writer, encoder)
	});

	const chain = ConversationalRetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(2), {
		qaChainOptions: {
			type: 'refine',
			prompt: HumanMessagePromptTemplate.fromTemplate(getQATemplate())
		},
		returnSourceDocuments: true,
		callbacks: chainCallBacks(writer, encoder),
		verbose: true,
		questionGeneratorChainOptions: {
			llm: new ChatOpenAI({
				temperature: 0.42,
				modelName: 'gpt-3.5-turbo'
			})
		}
	});

	// chain.questionGeneratorChain.llm = new ChatOpenAI({
	// 	temperature: 0.42,
	// 	modelName: 'gpt-3.5-turbo'
	// });

	chain.call({
		question,
		chat_history: historyToTemplates(history) || []
	});

	return stream;
};

const chainCallBacks = (writer, encoder) => {
	return CallbackManager.fromHandlers({
		handleChainEnd: async (output) => {
			await writer.ready;
			const metadata = [];
			output.sourceDocuments?.forEach(async (doc) => {
				metadata.push(doc.metadata);
			});

			if (metadata.length) {
				await writer.write(encoder.encode(JSON.stringify({ metadata })));
			}

			await writer.close();
		},
		handleChainError: async (e) => {
			console.log('chain error happened', e);
			await writer.ready;
			await writer.abort(e);
			throw e;
		}
	});
};

const llmCallback = (writer, encoder) => {
	return CallbackManager.fromHandlers({
		handleLLMNewToken: async (token) => {
			await writer.ready;
			await writer.write(encoder.encode(`${token}`));
		}
	});
};

const getReteiever = (embeddings) => {
	return new SupabaseHybridSearch(embeddings, {
		client: supabase_client,
		similarityK: 1,
		keywordK: 1,
		tableName: 'documents',
		similarityQueryName: 'match_documents',
		keywordQueryName: 'kw_match_documents'
	});
};

const generateQuestion = () => {
	return `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. 
  If the follow up question is not closesly related to the chat history, the chat history must be ignored when generating the standalone question and your job is to repeat the follow up question exactly. 

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
};

const getQATemplate = () => {
	const qa_template = `
  You are the AI version of Osho and this is your discourse going on. 
  You take questions from your followers and answer them.
  Talk in Osho Tone. Give stories and examples.
	 
  You learn from the context provided below and answer the question at the end.
  
  Answer strictly in Hindi
  
  context: {context}

  Generate an answer to the following question. Think steps by steps, take your time.
  Question: {question}


  Helpful Answer:`;

	return qa_template;
};
