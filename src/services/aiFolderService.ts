

export async function createFolder(folderName: string) {
  try {
    if (!folderName || typeof folderName !== 'string') {
      return { ok: false, error: 'Invalid folder name' };
    }

    
    const safeName = folderName.replace(/\\|\//g, '').replace(/\.\./g, '').trim();
    if (!safeName) return { ok: false, error: 'Invalid folder name' };

    const relPath = `aiaccess/${safeName}`;

    if ((window as any).electronAPI && (window as any).electronAPI.fsMkdir) {
      const res = await (window as any).electronAPI.fsMkdir(relPath);
      if (res && res.ok) return { ok: true, path: relPath };
      return { ok: false, error: res?.error || 'Failed to create folder' };
    }

    return { ok: false, error: 'Electron API not available' };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function openFolder(folderName: string) {
  try {
    if (!folderName || typeof folderName !== 'string') {
      return { ok: false, error: 'Invalid folder name' };
    }

    const safeName = folderName.replace(/\\|\//g, '').replace(/\.\./g, '').trim();
    if (!safeName) return { ok: false, error: 'Invalid folder name' };

    
    if ((window as any).electronAPI && (window as any).electronAPI.getProjectRoot && (window as any).electronAPI.openFolder) {
      const root: string = await (window as any).electronAPI.getProjectRoot();
      const fullPath = `${root.replace(/\\\\/g, '/')}/aiaccess/${safeName}`;
      
      (window as any).electronAPI.openFolder(fullPath);
      return { ok: true, path: fullPath };
    }

    return { ok: false, error: 'Electron API not available' };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function writeClipboardToFile(fileName: string) {
  try {
    if (!fileName || typeof fileName !== 'string') {
      return { ok: false, error: 'Invalid file name' };
    }

    const safeName = fileName.replace(/\\|\//g, '').replace(/\.\./g, '').trim();
    if (!safeName) return { ok: false, error: 'Invalid file name' };

    
    let clipboardText = '';
    if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.readText) {
      try {
        clipboardText = await (navigator as any).clipboard.readText();
      } catch (e) {
        
        return { ok: false, error: 'Unable to read clipboard: ' + (e?.message || String(e)) };
      }
    } else {
      return { ok: false, error: 'Clipboard API not available' };
    }

    const relPath = `aiaccess/${safeName}`;
    if ((window as any).electronAPI && (window as any).electronAPI.fsWrite) {
      const res = await (window as any).electronAPI.fsWrite(relPath, clipboardText || '');
      if (res && res.ok) return { ok: true, path: relPath };
      return { ok: false, error: res?.error || 'Failed to write file' };
    }

    return { ok: false, error: 'Electron API not available' };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function listFolder(folderName?: string) {
  try {
    const safeName = folderName && typeof folderName === 'string'
      ? folderName.replace(/\\|\//g, '').replace(/\.\./g, '').trim()
      : '';

    const relPath = safeName ? `aiaccess/${safeName}` : `aiaccess`;

    if ((window as any).electronAPI && (window as any).electronAPI.fsList) {
      const res = await (window as any).electronAPI.fsList(relPath);
      if (res && Array.isArray(res)) {
        return { ok: true, entries: res };
      }
      if (res && res.error) return { ok: false, error: res.error };
      return { ok: false, error: 'Failed to list folder' };
    }

    return { ok: false, error: 'Electron API not available' };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
