import { AzureOpenAI } from "openai";
// import type {
//   ChatCompletion,
//   ChatCompletionCreateParamsNonStreaming,
// } from "openai/resources/index";
const endpoint = "https://invite-instance-openai.openai.azure.com";
const apiKey = "a3babad21aee482798891f0e56f538f4";
const apiVersion = "2024-02-15-preview";
const deploymentName = "gpt4-o";
function getClient() {
    return new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion,
        deployment: deploymentName,
    });
}
function createMessages() {
    return {
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: "Does Azure OpenAI support customer managed keys?",
            },
            {
                role: "assistant",
                content: "Yes, customer managed keys are supported by Azure OpenAI?",
            },
            { role: "user", content: "Do other Azure AI services support this too?" },
        ],
        model: "",
    };
}
async function printChoices(completion) {
    for (const choice of completion.choices) {
        console.log(choice.message);
    }
}
export async function main() {
    const client = getClient();
    const messages = createMessages();
    const result = await client.chat.completions.create(messages);
    await printChoices(result);
}
main().catch((err) => {
    console.error("The sample encountered an error:", err);
});
//# sourceMappingURL=openai-config.js.map