<script lang="ts">
	import Header from '$components/Header.svelte';

	import MessageInput from '$components/MessageInput.svelte';
	import MessageList from '$components/MessageList.svelte';
	import { loading_state } from '$lib/store';

	$: loading = $loading_state === 'loading';
</script>

<div class="flex flex-col items-center w-screen h-screen">
	<Header />
	<div class="flex flex-1 flex-col justify-center w-[80%] center h-screen overflow-hidden">
		<MessageList />
		<MessageInput />
	</div>
</div>
