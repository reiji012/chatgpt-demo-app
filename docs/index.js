const inputField = document.getElementById("input-field");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-container");
const apiKeyInput = document.getElementById("api-key-input");

const messages = [
    {
        "role": "system",
        "content": "あなたは最高の料理人です。・ユーザーに適切な料理を振る舞うために、必要となる質問を投げかけてください・複数の質問の後、適切な料理を提案してください。・1回の質問内容は１つだけです。・また質問する際は、謝罪などの前置きは不要で、質問だけしてください。・料理を提案する際は、多くて2種類に絞られる場合に提案してください。・質問は少なくとも3回以上すること。Userは「あなた」と呼んでください。"
    },
    {
        "role": "assistant",
        "content": "私はあなたの体調・気分に合わせて料理を提供するためのアシスタントです。まずはあなたの現在の体調をお聞かせできますか？"
    }
];


// Enterキーで送信
inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
    }
});

sendButton.addEventListener("click", async () => {
    const messageText = inputField.value.trim();
    if (!messageText) return;

    const prompt = createPrompt(messageText);
    messages.push({ role: "user", content: prompt });
    addMessageToChat(prompt, "sender");

    inputField.value = "";
    inputField.disabled = true;
    sendButton.disabled = true;

    const indicator = createIndicator();
    const reply = await getChatGPTResponse(prompt);

    console.log("messages: ");
    console.log(messages);

    document.body.removeChild(indicator);
    inputField.disabled = false;
    sendButton.disabled = false;

    if (!reply) return;
    messages.push({ role: "assistant", content: reply });
    addMessageToChat(reply, "receiver");
});

function createPrompt(prompt) {
    return prompt;
}

function addMessageToChat(text, role) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message", role);
    newMessage.textContent = text;
    chatContainer.appendChild(newMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getChatGPTResponse(prompt) {
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
        alert("APIキーが入力されていません。");
        return;
    }

    const endpoint = "https://api.openai.com/v1/chat/completions";
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    });

    const requestBody = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7,
        // "max_tokens": 50,
    });

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: requestBody
        });

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        console.log("response: ")
        console.log(data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
        return "エラーが発生しました。";
    }
}

function createIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "loading-indicator";
    indicator.style.display = "flex";
    indicator.style.justifyContent = "center";
    indicator.style.alignItems = "center";
    indicator.style.position = "fixed";
    indicator.style.top = "0";
    indicator.style.left = "0";
    indicator.style.width = "100%";
    indicator.style.height = "100%";
    indicator.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    indicator.style.zIndex = "1000";

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");
    indicator.appendChild(spinner);
    document.body.appendChild(indicator);
    return indicator;
}