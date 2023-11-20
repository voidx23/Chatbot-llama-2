import OpenAI from 'openai'


import dotenv from 'dotenv';


dotenv.config({ path: '../../.env' });

const apiKey1 = "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"
const openai = new OpenAI({ apiKey:apiKey1  });


const generateChatResponse = async (message) => {
console.log(process.env.OpenAI_APIKey)

    try {

        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: message }],
            model: "gpt-3.5-turbo",
        });



        return response.choices[0];

    } catch (error) {
        console.error('OpenAI API error:', error.response ? error.response.data : error.message);
        throw error;
    }


};

export default generateChatResponse;