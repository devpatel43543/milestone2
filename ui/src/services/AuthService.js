import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    ConfirmSignUpCommand,
    GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = "us-east-1";
const CLIENT_ID = "6tvbms1723vnkoqgmccrnnoj4u"; // Replace with your actual Cognito User Pool Client ID

const client = new CognitoIdentityProviderClient({ region: REGION });

export const signUp = async (email, password, name, role) => {
    const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email },
            { Name: "name", Value: name },
            { Name: "custom:role", Value: role },
        ],
    });
    return await client.send(command);
};

export const confirmSignUp = async (email, code) => {
    const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
    });
    return await client.send(command);
};

export const signIn = async (email, password) => {
    const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    });
    return await client.send(command);
};

export const getCurrentUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        return null;
    }
    try {
        const command = new GetUserCommand({
            AccessToken: accessToken,
        });
        const response = await client.send(command);
        return response; // Returns user attributes if token is valid
    } catch (error) {
        console.error("Error verifying user:", error);
        return null; // Token invalid or expired
    }
};