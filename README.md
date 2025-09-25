# Class Search Demo API

The following is a simple Express server hosted on Lambda that operates the `Demo Mode` for the Class Search application.
There are three primary endpoints:

1. `/*.*.IScript_ClassSearchOptions` - Returns the Class Search options available for this demo university.
2. `/*.*.IScript_ClassSearchResults` - Returns the Class Search results for a given set of search parameters.
3. `/*.*.IScript_ClassSearchCourseDetails` - Returns the Class Search course details for a given course.

## Setup

If you would like to run this server locally, you will need to have Node.js and npm installed on your machine. Additionally please make a MongoDB instance either locally or in the cloud using a provider such as MongoDB Atlas.

Next follow to run the server, please follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the necessary dependencies.
4. Create a `.env` file in the root of the project and add the following environment variables:
   ```
   MONGODB_URI=<Your MongoDB URI>
   SEARCH_OPTIONS_URL=<Your Search Options URL>
   SEARCH_RESULTS_URL=<Your Search Results URL>
   COURSE_DETAILS_URL=<Your Course Details URL>
   ```
5. Run `serverless offline start` to start the server locally.
6. The server should now be running on `http://localhost:3000`.

> [!NOTE]
> You will need to make the MongoDB database before you can run the server. Run `npm run make-db` to create the database and populate it with sample data provided in the `data` folder. If you would like to use your own data, you can modify the CSV files in the `data` folder before re-running the command.

7. You can test the endpoints using a tools such as Postman or cURL. Alternatively open your web browser and navigate to the endpoints. If you would like to test with Class Search modify the `Demo` attribute in the redirect object in `csuLinks.ts` to `http://localhost:3000/`.

8. To stop the server, press `Ctrl + C` in the terminal.

## Deployment

To deploy the server to AWS Lambda, you will need to have the Serverless account and configured to be linked with your AWS account. You can follow the instructions [here](https://www.serverless.com/framework/docs/getting-started/).

> [!TIP]
> Run `npm install -g serverless` to install the Serverless CLI globally. This makes it available for all terminal instances and any future projects you may create.

Afterwards run `serverless login` to login to your Serverless account.

Once you have the Serverless CLI set up, you can deploy the server by running the following command in the project directory: `serverless deploy`.

Refer to Class Search [repo](https://github.com/Brian-Kwong/ClassSearch) and [documentation](https://brian-kwong.github.io/ClassSearch/getting-started.html) for additional configuration required to use the Demo Mode.
