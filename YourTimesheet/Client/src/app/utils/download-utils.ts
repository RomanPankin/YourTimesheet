export class DownloadUtils {
   public static downloadFile(data: any, fileName: string, mime: string) {
      const blob = new Blob([data], {type: mime || 'application/octet-stream'});

      if (typeof window.navigator.msSaveBlob !== 'undefined') {
         window.navigator.msSaveBlob(blob, fileName);

      } else {
         const blobURL = (window.URL && window.URL.createObjectURL) ?
            window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);

         const tempLink = document.createElement('a');
         tempLink.style.display = 'none';
         tempLink.href = blobURL;
         tempLink.setAttribute('download', fileName);

         if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
         }

         document.body.appendChild(tempLink);
         tempLink.click();

         setTimeout(() => {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
         }, 200);
      }
   }
}
