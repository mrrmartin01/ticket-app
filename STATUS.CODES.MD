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

| Status Code | Description         | Usage                                                |
| ----------- | ------------------- | ---------------------------------------------------- |
| E1001       | EMPTY_FIELD         | A form was submitted empty.                          |
| E1001A      | PARTIAL_DATA_INPUT  | A form field is empty.                               |
| E1002       | USER_ALREADY_EXISTS | A user with this email already exists.               |
| N0404       | USER_NOT_FOUND      | No user exits in database with the login credentials |
| SP1001      | SAME_PASSWORD       | User entered same password as the previous           |
| U1001       | WRONG_CREDENTALS    | User enter wrong credentials                         |
