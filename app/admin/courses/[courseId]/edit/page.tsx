import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import { CourseStructure } from "./_components/CourseStructure";
import { ExportCourseButton } from "./_components/ExportCourseButton";
import { requireSession } from "@/app/data/auth/require-session";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ courseId: string }>;

export default async function EditRoute({ params }: { params: Params }) {
  const { courseId } = await params;
  const data = await adminGetCourse(courseId);
  const { user } = await requireSession({ minRole: "MENTOR" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/courses"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-3xl font-bold">
            Edit Course:{" "}
            <span className="text-primary underline">{data.title}</span>
          </h1>
        </div>
        {user.role === "ADMIN" && (
          <Suspense fallback={<Skeleton className="h-10 w-32" />}>
            <ExportCourseButton
              courseId={courseId}
              courseTitle={data.title}
            />
          </Suspense>
        )}
      </div>

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
              <CardDescription>
                Basic Information about the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditCourseForm data={data} userRole={user.role ?? undefined} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="course-structure">
          <Card>
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>
                Here you can update your Course Structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseStructure data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
