
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Settings, Users, MapPin, School, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectRoute } from '@/components/auth/ProtectRoute';


const formSchema = z.object({
  // Personal Details
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),

  // Academic Details
  careerPath: z.string().min(1, 'Please select a career path.'),
  academicLevel: z.string().min(1, 'Please select an academic level.'),
  category: z.string().optional(),
  tshirtSize: z.string().optional(),

  // Sign-in & Security
  primaryContactNumber: z.string().optional(),
  primaryEmail: z.string().optional(),
  password: z.string().optional(),
  studentContactNumber: z.string().optional(),
  studentEmail: z.string().optional(),

  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function SettingsPageContent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, userSettings, updateUserSettings } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      careerPath: '',
      academicLevel: '',
      primaryEmail: '',
      primaryContactNumber: '',
      password: 'password123',
      dateOfBirth: '',
      nationality: '',
      bloodGroup: '',
      category: '',
      tshirtSize: ''
    },
  });
  
  useEffect(() => {
    if (userSettings) {
      form.reset({
        ...form.getValues(),
        firstName: userSettings.firstName || user?.displayName?.split(' ')[0] || '',
        lastName: userSettings.lastName || user?.displayName?.split(' ')[1] || '',
        primaryEmail: user?.email || '',
        careerPath: userSettings.careerPath || '',
        academicLevel: userSettings.academicLevel || '',
        gender: userSettings.gender || '',
        nationality: userSettings.nationality || '',
        dateOfBirth: userSettings.dateOfBirth || '',
        bloodGroup: userSettings.bloodGroup || '',
        category: userSettings.category || '',
        tshirtSize: userSettings.tshirtSize || '',
        primaryContactNumber: userSettings.primaryContactNumber || '',
        studentContactNumber: userSettings.studentContactNumber || '',
        studentEmail: userSettings.studentEmail || '',
      });
    }
  }, [user, userSettings, form]);


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      await updateUserSettings(user.uid, data);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Error",
        description: "Could not update your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and learning preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="personal" className="flex flex-col md:flex-row gap-8">
            <TabsList className="flex md:flex-col h-auto md:w-1/4 bg-transparent p-0 items-start gap-2">
              <TabsTrigger value="personal" className="w-full justify-start gap-2"><User /> Personal Details</TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start gap-2"><Lock /> Sign-in & Security</TabsTrigger>
              <TabsTrigger value="preferences" className="w-full justify-start gap-2"><Settings /> My Preferences</TabsTrigger>
              <TabsTrigger value="guardian" className="w-full justify-start gap-2"><Users /> Guardian Details</TabsTrigger>
              <TabsTrigger value="address" className="w-full justify-start gap-2"><MapPin /> Address Details</TabsTrigger>
              <TabsTrigger value="academic" className="w-full justify-start gap-2"><School /> Academic Details</TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="personal">
                <Card>
                  <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Your First name *</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Your Last name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Select your Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nationality" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl><Input placeholder="e.g., Indian" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader><CardTitle>Sign-in & Security</CardTitle></CardHeader>
                  <CardContent className="space-y-8">
                     <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="primaryContactNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Contact Number *</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Input defaultValue="+91" className="w-16 bg-muted" readOnly />
                                        <Input {...field} className="flex-1 bg-muted" />
                                        <Button variant="link" type="button">Change</Button>
                                    </div>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="primaryEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Input {...field} className="flex-1 bg-muted" readOnly />
                                        <Button variant="link" type="button">Change</Button>
                                    </div>
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="flex items-center gap-2 max-w-sm">
                                    <Input type="password" value="••••••••••" className="flex-1 bg-muted" readOnly />
                                    <Button variant="link" type="button">Change</Button>
                                </div>
                            </FormItem>
                        )} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-medium">Student Contact Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="studentContactNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student Contact Number</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Input defaultValue="+91" className="w-16" />
                                        <div className="relative w-full">
                                            <Input {...field} placeholder=" " className="flex-1" />
                                            <Button variant="link" type="button" className="absolute right-2 top-1/2 -translate-y-1/2">+Add</Button>
                                        </div>
                                    </div>
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="studentEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="relative w-full">
                                        <Input type="email" {...field} placeholder=" " />
                                        <Button variant="link" type="button" className="absolute right-2 top-1/2 -translate-y-1/2">+Add</Button>
                                    </div>
                                </FormItem>
                            )} />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader><CardTitle>My Preferences</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <p className="text-muted-foreground">Placeholder for user preferences.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guardian">
                <Card>
                  <CardHeader><CardTitle>Guardian Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <p className="text-muted-foreground">Placeholder for guardian details.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address">
                <Card>
                  <CardHeader><CardTitle>Address Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <p className="text-muted-foreground">Placeholder for address details.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Details</CardTitle>
                    <CardDescription>
                      Update your career goals and academic level to get a newly tailored learning path on your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="careerPath" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Career Path</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a career" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                                    <SelectItem value="UX/UI Designer">UX/UI Designer</SelectItem>
                                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                                    <SelectItem value="Doctor">Doctor</SelectItem>
                                    <SelectItem value="Lawyer">Lawyer</SelectItem>
                                    <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                                    <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                                    <SelectItem value="Not Decided Yet">Not Decided Yet</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="academicLevel" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Academic Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Middle School">Middle School (Grades 6-8)</SelectItem>
                                    <SelectItem value="High School">High School (Grades 9-12)</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Lifelong Learner">Lifelong Learner</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category *</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="OBC">OBC</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="ST">ST</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="tshirtSize" render={({ field }) => (
                            <FormItem>
                            <FormLabel>T-Shirt Size</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select T-Shirt Size" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="S">Small</SelectItem>
                                    <SelectItem value="M">Medium</SelectItem>
                                    <SelectItem value="L">Large</SelectItem>
                                    <SelectItem value="XL">X-Large</SelectItem>
                                    <SelectItem value="XXL">XX-Large</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <div className="flex justify-end gap-2 mt-8">
                 <Button variant="outline" type="button" onClick={() => form.reset()}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Update
                        </>
                    )}
                  </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <ProtectRoute>
            <SettingsPageContent />
        </ProtectRoute>
    )
}
