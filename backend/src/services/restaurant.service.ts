import {Request, Response } from "express";
import prisma from "../config/prisma";

export const createRestaurant = async (data: 
    {
        name:string,
        slug:string,
        description:string,
        cuisine:string,
        ownerId:string,
        city:string,
        address:string,
        country:string,
        phoneNumber:string,
        email:string,
        logoUrl:string,
        coverImage:string,
        openingTime:string,
        closingTime:string,
        capacity:number,
        startingPrice:number,
    }) => {
    return prisma.restaurant.create({
        data,
    });
}