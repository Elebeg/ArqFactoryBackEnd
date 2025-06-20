export class CpfValidator {
    static validate(cpf: string): boolean {
      cpf = cpf.replace(/[^\d]/g, '');
  
      if (cpf.length !== 11) return false;
  
      if (/^(\d)\1{10}$/.test(cpf)) return false;
  
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
  
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(10))) return false;
  
      return true;
    }
  
    static format(cpf: string): string {
      cpf = cpf.replace(/[^\d]/g, '');
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  
    static clean(cpf: string): string {
      return cpf.replace(/[^\d]/g, '');
    }
  }