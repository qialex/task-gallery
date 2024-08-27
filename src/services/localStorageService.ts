export class LocalStorageService {
  
  static PREFIX = 'GALLERY';

  static getItem = (key: string): string|null => {
    try {
      return localStorage.getItem([LocalStorageService.PREFIX,key].join('_'))
    } catch (e) {
      return null
    }
  }
  static setItem = (key: string, value: string): boolean => {
    try {
      localStorage.setItem([LocalStorageService.PREFIX,key].join('_'), value)
      return true
    } catch (e) {
      return false
    }
  }
}