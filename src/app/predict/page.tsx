"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, MessageSquare, X } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const predictionSchema = z.object({
  year: z.coerce.number().min(2022, "Year must be in the future."),
  gender: z.enum(["Male", "Female"], { required_error: "Please select a gender." }),
  schoolType: z.enum(["Public", "Private"], { required_error: "Please select a school type." }),
  classSize: z.coerce.number().min(1, "Class size must be positive.").max(100000, "Class size seems too large."),
});

export default function PredictPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [showInsightPopup, setShowInsightPopup] = useState(false)
  const [lastPrediction, setLastPrediction] = useState<{ year: number; gender: string; schoolType: string; classSize: number; result: number } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof predictionSchema>>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      year: new Date().getFullYear() + 1,
      classSize: 20000,
    },
  });

  const onSubmit = async (values: z.infer<typeof predictionSchema>) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await api.predict({
        year: values.year,
        gender: values.gender,
        school_type: values.schoolType,
        total_sat: values.classSize
      });
      setResult(response.predicted_pass_rate);
      setLastPrediction({
        year: values.year,
        gender: values.gender,
        schoolType: values.schoolType,
        classSize: values.classSize,
        result: response.predicted_pass_rate
      });
      setShowInsightPopup(true);
    } catch (error: any) {
      toast({
        title: "Prediction Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-120px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Future Performance Predictor</CardTitle>
          <CardDescription>Enter parameters to forecast WAEC pass rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="classSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Class Size (Total Sat)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 15000" type="number" {...field} />
                    </FormControl>
                    <FormDescription>Avg for Public: 20k, Private: 1k</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full mt-4" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Calculating..." : "Generate Prediction"}
              </Button>
            </form>
          </Form>
        </CardContent>

        {result !== null && (
          <CardFooter className="flex flex-col items-center justify-center bg-muted/50 border-t rounded-b-lg p-6 transition-all">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Predicted Pass Rate</span>
            <span className="text-4xl font-bold text-primary">{result}%</span>
          </CardFooter>
        )}
      </Card>

      {/* Insight Popup */}
      {showInsightPopup && lastPrediction && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Card className="w-80 shadow-xl border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Get AI Insights</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowInsightPopup(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Want to understand why the predicted pass rate is <span className="font-semibold text-primary">{lastPrediction.result}%</span>?
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                className="w-full"
                onClick={() => {
                  const query = encodeURIComponent(
                    `I just predicted a ${lastPrediction.result}% pass rate for ${lastPrediction.gender} students in ${lastPrediction.schoolType} schools for year ${lastPrediction.year} with a class size of ${lastPrediction.classSize}. Can you explain what factors might influence this prediction and provide insights on how to improve it?`
                  );
                  router.push(`/chat?q=${query}`);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with AI
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
