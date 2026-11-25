import prisma from "@/lib/prisma";
import { getUser, isPrivilaged } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { profile } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request : NextRequest){

    const hasPrivilage = await isPrivilaged(request, "users:read")

    if (!hasPrivilage) {
        return NextResponse.json(
            {
                message : "You do not have the required privilages to access this resource"
            },
            {
                status : 403
            }
        )
    }

    // Set Paginations

    const pageNumberInString = request.nextUrl.searchParams.get("pageNumber")
    const pageSizeInString = request.nextUrl.searchParams.get("pageSize")


    const pageNumber = parseInt(pageNumberInString || "1")
    const pageSize = parseInt(pageSizeInString || "10")

    const userCount = await prisma.user.count()

    const totalPages = Math.ceil(userCount / pageSize)

    if (pageNumber > totalPages) {
        return NextResponse.json(
            {
                message : "Page number exceeds total pages"
            },
            {
                status : 400
            }
        )
    }

    const users = await prisma.user.findMany({
        skip : (pageNumber - 1) * pageSize,
        take : pageSize,
        select : {
            id : true,
            email : true,
            phone : true,
            firstName : true,
            lastName : true,
            password : false,
            role : true,
            status : true,
            createdAt : true,
            lastLogin : true,
            privileges : true
        }
    })

    return NextResponse.json(
        {
            message : "Users fetched successfully",
            users : users,
            pagination : {
                pageNumber : pageNumber,
                pageSize : pageSize,
                totalPages : totalPages,
                totalCount : userCount
            }
        },
        {
            status : 200
        }
    )    
}

export async function POST(request : NextRequest){
    // email, firstname, lastname, password, phone(optional)

    const body = await request.json()

    if(body.email == null ){
       return NextResponse.json(
        {
            message : "Email is required"
        },
        {
            status : 400
        }
       ) 
    }

    if(body.firstName == null ){    
       return NextResponse.json(
        {
            message : "First name is required"
        },
        {
            status : 400
        }
       ) 
    }

    if(body.lastName == null ){
       return NextResponse.json(
        {
            message : "Last name is required"
        },
        {
            status : 400
        }
       ) 
    }

    if(body.password == null ){
       return NextResponse.json(
        {
            message : "Password is required"
        },
        {
            status : 400
        }
       ) 
    }

    const existingUser = await prisma.user.findUnique({
        where : {
            email : body.email
        }
    })

    if(existingUser != null){
        return NextResponse.json(
            {
                message : "User with this email already exists"
            },
            {
                status : 409
            }
        )
    }

    const passwordHash = await bcrypt.hash(body.password, 12)

    await prisma.user.create({
        data : {
            email : body.email,
            firstName : body.firstName,
            lastName : body.lastName,
            password : passwordHash,
            phone : body.phone || null
        }
    })

    return NextResponse.json(
        {
            message : "User created successfully"
        },
        {
            status : 201
        }
    )
}

export async function PUT(request : NextRequest){

    const id = request.nextUrl.searchParams.get("id")

    if (id == null) {
        return NextResponse.json(
            {
                message : "User ID is required"
            },
            {
                status : 400
            }
        )
    }

    const requestedUser = await getUser(request)

    if(requestedUser == null){
        return NextResponse.json(
            {
                message : "You are not logged in"
            },
            {
                status : 401
            }
        )
    }

    if(requestedUser.id == id){
        // user is trying to update their own account

        // maver allow users to update their own role, status and privilages.

        const user = await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        const body = await request.json()

        if (user == null) {
            return NextResponse.json(
                {
                    message : "User not found"
                },
                {
                    status : 404
                }
            )
        }

        await prisma.user.update(
            {
                where : {
                    id : id
                },
                data : {
                    email : body.email || user.email,
                    firstName : body.firstName || user.firstName,
                    lastName : body.lastName || user.lastName,
                    phone : body.phone || user.phone,
                    profileImage : body.profileImage || user.profileImage
                }
            }
        )

        return NextResponse.json(
            {
                message : "User updated successfully"
            },
            {
                status : 200
            }
        )
    }else{
        // user is trying to update someone else's account. privilages checking

        const hasPrivilage = await isPrivilaged(request, "users:edit")

        const body = await request.json()

        if (!hasPrivilage) {
            return NextResponse.json(
                {
                    message : "You do not have the required privilages to access this resource"
                },
                {
                    status : 403
                }
            )
        }

        const user = await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        if (user == null){
            return NextResponse.json(
                {
                    message : "The user not Found"
                },
                {
                    status : 402
                }
            )
        }

        await prisma.user.update(
            {
                where : {
                    id : id
                },
                data : {
                    email : body.email || user.email,
                    firstName : body.firstName || user.firstName,
                    lastName : body.lastName || user.lastName,
                    phone : body.phone || user.phone,
                    profileImage : body.profileImage || user.profileImage,
                    status : body.status || user.status,
                    privilages : body.privilages || user.privileges,
                    role :body.role || user.role
                }
            }
        )

        return NextResponse.json(
            {
                message : "User updated successfully"
            },
            {
                status : 200
            }
        )
    }
}