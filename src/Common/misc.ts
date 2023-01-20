import { PathLike, readdir } from "fs";
import { join } from "path";

export async function GetFiles(path: PathLike) {
    return await new Promise<string[]>(resolve => {
        readdir(path, {}, async (err, data) => {
            if (err) console.error(err);
            
            if (data.length === 0) resolve([]);
            let files: string[] = [];
            for (const currentPath of data) {
                if (IsFile(currentPath)) {
                    files.push(join(path.toString(), currentPath.toString()));
                } else {
                    const paths = await GetFiles(join(path.toString(), currentPath.toString()));
                    if (paths.length === 0) continue;
                    paths.forEach(filePath => files.push(filePath));
                }
            }
            resolve(files);
        });
    });
}

function IsFile(path: PathLike) {
    return (path as string).includes(".");
}