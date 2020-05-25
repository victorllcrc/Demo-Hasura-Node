const { execute } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');

const getWsClient = function(wsurl) {
  const client = new SubscriptionClient(
    wsurl, {reconnect: true}, ws
  );
  return client;
};

// wsurl: GraphQL endpoint
// query: GraphQL query
// variables: Query variables object
const createSubscriptionObservable = (wsurl, query, variables) => {
  const link = new WebSocketLink(getWsClient(wsurl));
  return execute(link, {query: query, variables: variables});
};

// Declaramos la suscripcion
const gql = require('graphql-tag');
const SUBSCRIBE_QUERY = gql`
subscription report_client($client_id: Int!){
  report(where:{client_id:{_eq:$client_id}}){
    client_id
    price_total
    date_purchase
  }
}
`;

function main() {
  const subscriptionClient = createSubscriptionObservable(
    'https://demo-crud-client.herokuapp.com/v1/graphql', // GraphQL endpoint
    SUBSCRIBE_QUERY,                                     // Subscription query
    {client_id: 5}                                       // Query variables
  );
  var consumer = subscriptionClient.subscribe(eventData => {
    console.log("Received event: ");
    console.log(JSON.stringify(eventData, null, 2));
  }, (err) => {
    console.log('Err');
    console.log(err);
  });
}

main();
