import { json } from '@sveltejs/kit';
import { makeChain } from '$lib/server/makechain'

export const POST = (async ({ request }) => {

	const { question, history } = (await request.json());

	// console.log({ history, question });

	if (!question || !history) {
		return json({ message: "Query not found" }, { status: 500 });
	}

	console.log("------>");

	try {
		const sanitizedQuestion = question.trim().replaceAll("\n", " ");

		const stream = makeChain(sanitizedQuestion, history);
		return new Response((await stream).readable, {
			headers: {
				"Content-Type": "text/event-stream",
				Connection: "keep-alive",
				"Cache-Control": "no-cache, no-transform",
			},
		});
	} catch (err) {
		console.log(err);
		return json({ message: "Some error occured " + err }, { status: 500 });
	}
});
