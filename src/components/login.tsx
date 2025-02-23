"use client"

import { useState } from "react"
import Link from "next/link"
import { useActionState } from "react"
import { authenticate } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReloadIcon } from "@radix-ui/react-icons"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [state, formAction] = useActionState(authenticate, {
    error: null,
    success: false,
  })

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Please enter your credentials to access the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select name="userType" required>
              <SelectTrigger id="userType" className="w-full">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="underwriter">Underwriter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
            />
          </div>

          {showTwoFactor && (
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Two-Factor Code</Label>
              <Input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" name="terms" required />
            <label htmlFor="terms" className="text-sm leading-none text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                privacy policy
              </Link>
            </label>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" disabled={isLoading}>
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}

