import { NextRequest } from "next/server";
import * as jose from "jose";

export async function getUser(request : NextRequest) : Promise<requestUserType | null> {
    const loginToken = request.cookies.get("token")?.value

    const secretText = process.env.JOSE_SECRET_KEY

    const secret = new TextEncoder().encode(secretText)

    try {
        const tokenData  = await jose.jwtVerify(
            loginToken || "",
            secret
        )

        const user = tokenData.payload as unknown as requestUserType

        return user

    } catch (error) {
        return null
    }
}

export async function isPrivilaged(request : NextRequest, privilege : string) : Promise<boolean> {

    const user : requestUserType | null = await getUser(request)

    if (user == null) {
        return false
    }

    if (user.privileges.includes(privilege)) {
        return true
    }else{
        return false
    }
}