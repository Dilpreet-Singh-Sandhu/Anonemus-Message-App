import { Message } from "@/models/User_model";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean
    messages?: Array<Message>
    // _id: string;
}