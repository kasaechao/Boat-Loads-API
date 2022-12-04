# Boats Loads Users REST API

CS493 - Cloud Application Development portfolio project. 

## Data Models

The API models **three** entities.
  1. Boats
  2. Loads
  3. Users

### Boats

|Property|Data Type|Notes|Required|
|---|---|---|---|
|id|integer|id of the boat auto-generated by the google datastore|No|
|name|string|name of the boat|Yes<sup>*</sup>|
|type|string|type of the boat E.g. sailboat, catarmaran, etc.|Yes<sup>*</sup>|
|length|integer|length of the boat in feet|Yes<sup>*</sup>|
|loads|array|list of loads currently on the boat|No|
|owner|string|owner of the boat|No|


### Loads

|Property|Data Type|Notes|Required|
|---|---|---|---|
|id|integer|id of the boat auto-generated by the google datastore|No|
|item|string|name of the load|Yes<sup>*</sup>
|creation_date|string|date when the load was created|Yes<sup>*</sup>
|volume|integer|the volume of the load in cubic feet|Yes<sup>*</sup>
|carrier|object|the boat that holds this load|No


### Users

|Property|Data Type|Notes|Required|
|---|---|---|---|
|id|integer|id of the boat auto-generated by the google datastore|No|
|name|string|name of the user extracted from provided jwt|No
|userId|string|user if of the user extracted from devdoed jwt|No
|owned_boats|array|list of boats owned by the user|No


<sup>*</sup>***Please reference API documentation for attribute constraints on an entity***

## API Summary

### Authorization and Authentication

CRUD operations for the boat entity is protected and requires authorization for a successful request. Authorization is provided in the request header via bearer token in the form of a [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token).

Authorization is handled via Oauth 2.0 flow. Auth0 is the chosen provider for this process to allow creation of new users. 

[Auth0 site link](https://auth0.com/)

[OAuth 2.0 Authorization Framework](https://auth0.com/docs/authenticate/protocols/oauth/)


### Relationships

  - The Boats and Users entitites are related such that a user can own a boat. 
  - Boats and Loads are related such that loads can be on boats, and boats can contain loads. 

### Supported Methods

  - Both boats and loads entities support CRUD operations (POST, GET, PUT, PATCH, DELETE)
  - boats have additional methods to add and remove loads
  - Users entity only supports GET method
  - Successful requests and unsuccessful requests will result in 2XX and 4XX status codes, respectively, and to include response bodies where applicable.
  

### ***See documentation for additional details***












