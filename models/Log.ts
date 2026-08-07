import mongoose ,{Schema,Document,Model} from 'mongoose';

export interface ILog extends Document{
    method:string;
    path:string;
    requestBody:unknown;
    responseStatus:number;
    responseData:unknown;
    createdAt:Date; 
}



const logSchema = new Schema<ILog>(
  {
    method: { type: String, required: true },
    path: { type: String, required: true },
    requestBody: { type: Schema.Types.Mixed },
    responseStatus: { type: Number, required: true },
    responseData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', logSchema);
export default Log;