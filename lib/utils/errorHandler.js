const ErrorBuilder = require("./ErrorBuilder");
const errorHandler = (error) => {
  if (error.response) {
    error.response.data = {
      module: `this error is coming from discord api not from the module it self, i suggest you to check if you passed the id of the channel correctly or the name of the channel is correct
        for more general info about the discord error 
        use error.error.errors you will get an object with the error message coming from discord api OR,
        please visit https://github.com/abdelrahman-tarek-0/Discord-Cloud-Database/blob/main/tests/error.json to see the possible errors`,
      ...error.response.data,
    };
    error.response.data.discordError = true;
    error.response.data.discordReqStatus = error.response.status;
    if (error.response.data.code === 40062) {
      throw new ErrorBuilder(
        "you are being rate limited by discord api",
        error.response.data
      );
    }
    throw new ErrorBuilder(error.message, error.response.data);
  } else {
    throw error;
  }
};

module.exports = errorHandler;
