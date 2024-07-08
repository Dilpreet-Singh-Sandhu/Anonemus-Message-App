'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/app/Schemas/signUpSchema"
import axios, {AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from "lucide-react"


const page = () => {
  const [username, setUsername] = useState('')
  const [usernameMessage, setusernameMessage] = useState('')
  const [isCheckingUsername, setisCheckingUsername] = useState(false)
  const [isSubmitting, setisSubmitting] = useState(false)
  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()

  //zod inplementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username){
        setisCheckingUsername(true)
        setusernameMessage('')
        try{
          const response = await axios.get(`/api/check-username-unique?username=${username}`)
          console.log("auth/page/axios-response", response)
          setusernameMessage(response.data.message)
        } catch (error){
          const axiosError = error as AxiosError<ApiResponse>;
          setusernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          )
        } finally {
          setisCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    // console.log(data)
    setisSubmitting(true)
    try{
      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast({
        title: 'Success',
        description: response.data.message
      })
      router.replace(`/verify/${username}`)
      setisSubmitting(false)
    } catch (error){
      console.error("Error in signup of user", error)
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive"
      })
      setisSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Welcome Back to True Feedback
        </h1>
        <p className="mb-4">Sign in to continue your secret conversations</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                <Input placeholder="username"
                {...field} 
                onChange={(e) => {
                  field.onChange(e)
                  debounced(e.target.value)
                }}
                />
                </FormControl>
                {isCheckingUsername && <Loader2 className="animate-spin"/>}
                <p className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500': 'text-red-500'}`}>
                    test {usernameMessage}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                <Input placeholder="email"
                {...field} 
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                <Input type="password" placeholder="Password"
                {...field} 
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='w-full' type="submit" disabled={isSubmitting}>
            {
              isSubmitting? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                </>
              ) : ('Signup')
            }
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4">
        <p>
          Not a member yet?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}

export default page
