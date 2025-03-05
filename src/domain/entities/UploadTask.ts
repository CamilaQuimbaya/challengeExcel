export class UploadTask {
  constructor(
    public id: string,
    public status: "pending" | "processing" | "done",
    public errors: { row: number; col: number; message: string }[] = []
  ) {}
}
