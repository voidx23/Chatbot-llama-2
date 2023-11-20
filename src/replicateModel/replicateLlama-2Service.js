import Replicate from "replicate";


const generateChatResponse = async (message,apiToken) => {

    try {
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        });
        const output = await replicate.run(
          "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
          {
            input: {
              prompt: message,
            },
          }
        );
      
        console.log(output);
        return output;
      } catch (error) {
        const errorMessage = error.message;
        const stackTrace = error.stack;
        const errorLine = error.message.split('\n')[1].split('at ')[0].trim();
      
        console.error('Replicate API error:', errorMessage, stackTrace);
        console.error('Error occurred at line:', errorLine);
        throw error;
      }
};

export default generateChatResponse;
