import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from "react"
import { authClient } from "@/lib/auth-client";
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'
import { GoogleButton } from './GoogleButton'

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const {refetchUser} = useUser();

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement)?.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const { data, error } = await authClient.signUp.email({
      email, // user email address
      password, // user password -> min 8 characters by default
      name: email, // user display name
      callbackURL: "http://localhost:3000" // A URL to redirect to after the user verifies their email (optional)
    }, {
      onRequest: (ctx) => {
        //show loading
        console.log("Signing up...");
      },
      onSuccess: (ctx) => {
        //redirect to the dashboard or sign in page
        refetchUser();
        navigate('/')
      },
      onError: (ctx) => {
        // display the error message
        console.log(ctx.error.details);
        alert(ctx.error.message);
      },
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">Welcome to The Student Helper</h1>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/sign_in" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="confirm-password">Confirm Password</Label>
              </div>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>
          <GoogleButton />
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
