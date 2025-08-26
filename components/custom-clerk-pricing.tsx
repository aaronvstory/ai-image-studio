'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CustomClerkPricing() {
    const router = useRouter()
    
    const handleSelectPlan = () => {
        router.push('/checkout')
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Demo Mode: Use test credit cards for checkout
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Get started with basic features</CardDescription>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">$0</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">Basic dashboard access</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">View demo content</span>
                            </li>
                            <li className="flex items-center opacity-50">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground mr-2" />
                                <span className="text-sm line-through">AI Image Generation</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan - Highlighted */}
                <Card className="relative border-primary shadow-lg">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                        Most Popular
                    </Badge>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>Perfect for creators</CardDescription>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">$29.99</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">Everything in Free</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm font-semibold">Unlimited AI Images</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">DALL-E 3 Access</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">HD Quality</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">All styles & sizes</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSelectPlan}>
                            Select Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>For teams and businesses</CardDescription>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">$99</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">Everything in Pro</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">Priority generation</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">API access</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">Team collaboration</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">24/7 Support</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={handleSelectPlan}>
                            Contact Sales
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>All plans include secure payment processing. Cancel anytime.</p>
                <p className="mt-2 font-semibold text-yellow-600 dark:text-yellow-500">
                    Demo Mode: No real charges will be made
                </p>
            </div>
        </div>
    )
}