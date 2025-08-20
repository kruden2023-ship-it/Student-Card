
export const parseCsv = <T,>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          // No data rows
          resolve([]);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data: T[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const entry: { [key: string]: string } = {};
          
          headers.forEach((header, index) => {
            entry[header] = values[index] ? values[index].trim() : '';
          });

          data.push(entry as unknown as T);
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};
