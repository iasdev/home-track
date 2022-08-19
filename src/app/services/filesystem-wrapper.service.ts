import { Injectable } from '@angular/core';
import { Directory, Encoding, Filesystem, ReadFileResult, WriteFileResult } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class FilesystemWrapperService {

  private readWriteDir = Directory.Documents
  private baseAppPath = "home-track-app"

  constructor() { }

  async listFiles(): Promise<string[]> {
    let value = await Filesystem.readdir({path: this.baseAppPath, directory: this.readWriteDir})
    return value.files.map(f => f.name)
  }

  write(content: string, fileNameWithExtension: string): Promise<WriteFileResult> {
    return Filesystem.writeFile({
      path: `${this.baseAppPath}/${fileNameWithExtension}`,
      data: content,
      directory: this.readWriteDir,
      encoding: Encoding.UTF8,
      recursive: true
    })
  }

  read(fileNameWithExtension: string): Promise<ReadFileResult> {
    return Filesystem.readFile({
      path: `${this.baseAppPath}/${fileNameWithExtension}`,
      directory: this.readWriteDir,
      encoding: Encoding.UTF8,
    })
  }
}