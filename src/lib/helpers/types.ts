export type LoadingState = 'loading' | 'idle' | 'streaming';

export type MessageList = Message[];

export type Message = {
	message: string;
	metadata: object;
	type: MessageType;
};

export type MessageType = 'userMessage' | 'apiMessage';
