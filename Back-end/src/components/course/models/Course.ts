import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
    courseId: string,
    name: string,
    credits: number,
    facultyId: mongoose.Types.ObjectId,
    description: string,
    prerequisiteCourse: mongoose.Types.ObjectId,
    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
    {
        courseId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        },
        credits: {
            type: Number,
            required: true,
            min: [0, 'Number of credits has to bigger than 2']
        },
        facultyId: {
            type: Schema.Types.ObjectId,
            ref: 'Faculty',
            required: true
        },
        description: {
            type: String,
        },
        prerequisiteCourse: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICourse>('Course', courseSchema)