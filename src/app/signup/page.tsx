
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { BrainCircuit, Github, KeyRound, Mail, User } from "lucide-react"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.853,44,30.342,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  )

export default function SignupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { signUp, signInWithGoogle, user, handleNewUserSetup } = useAuth()
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [fullName, setFullName] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [googleLoading, setGoogleLoading] = React.useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await signUp(email, password, fullName)
            toast({
                title: "Verification Email Sent",
                description: "Please check your email to verify your account before logging in.",
            })
            router.push("/login");
        } catch (error: any) {
             toast({
                title: "Sign-up Failed",
                description: error.message || "Could not create an account.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

     const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        try {
            await signInWithGoogle()
        } catch(error: any) {
            toast({
                title: "Google Sign-in Failed",
                description: error.message || "Could not sign in with Google.",
                variant: "destructive",
            })
        } finally {
            setGoogleLoading(false)
        }
    }

    React.useEffect(() => {
        if (user) {
            handleNewUserSetup(user);
        }
    }, [user, handleNewUserSetup])

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account. You will need to verify your email address.
            </p>
          </div>
          <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="fullname" 
                    placeholder="John Doe" 
                    required 
                    className="pl-10" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || googleLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="pl-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || googleLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
               {loading && <Loader2 className="animate-spin mr-2" />}
              Create Account
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={loading || googleLoading}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading || googleLoading}>
               {googleLoading ? <Loader2 className="animate-spin mr-2" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center lg:flex-col p-12 text-center">
        <BrainCircuit className="h-24 w-24 text-primary mb-4" />
        <h2 className="text-4xl font-bold font-headline">Begin Your Journey</h2>
        <p className="text-muted-foreground mt-4 max-w-md">
        Join Medha today and transform your learning experience. Get access to powerful AI tools designed to help you succeed.
        </p>
      </div>
    </div>
  )
}
