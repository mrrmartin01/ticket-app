# HTTP Status Codes Reference

| Status Code | Description           | Usage |
| ----------- | --------------------- | ----- |
| 200         | OK                    |       |
| 201         | Created               |       |
| 400         | Bad Request           |       |
| 401         | Unauthorized          |       |
| 403         | Forbidden             |       |
| 404         | Not Found             |       |
| 500         | Internal Server Error |       |
| 503         | Service Unavailable   |       |

# Error Codes Reference

| Status Code | Description          | Usage                                                          |
| ----------- | -------------------- | -------------------------------------------------------------- |
| E1001       | EMPTY_FIELD          | A form was submitted empty.                                    |
| E1001A      | PARTIAL_DATA_INPUT   | A form field is empty.                                         |
| E1002       | USER_ALREADY_EXISTS  | A user with this email already exists.                         |
| E1003       | VENUE_ALREADY_EXISTS | A venue with this name already exists.                         |
| E1004       | USER_ID_MISSING      | User ID is required to create an event.                        |
| E1005       | EVENT_CONFLICT       | An event with this name at the same venue has a time conflict. |
| N0404       | USER_NOT_FOUND       | No user exists in database with the login credentials          |
| V0404       | VENUE_NOT_FOUND      | No venue exists in database with the provided ID               |
| E0404       | EVENT_NOT_FOUND      | No event exists in database with the provided ID               |
| SP1001      | SAME_PASSWORD        | User entered same password as the previous                     |
| U1001       | WRONG_CREDENTALS     | User enter wrong credentials                                   |
