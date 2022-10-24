import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  public generos = ['Masculino', 'Feminino', 'Não Informado', 'Informar Outro'];

  public formulario: FormGroup;

  constructor(private fb:FormBuilder) {
    this.formulario = fb.group({
      nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      sobrenome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      cpf: ['', Validators.compose([Validators.required, cpfValidator()])],
      genero: ['', Validators.compose([Validators.required])],
      outroGenero: ['', Validators.compose([requiredOutroGeneroValidator()])],
      cep: ['', Validators.compose([Validators.required, cepLengthValidator()])],
      estado: ['', Validators.compose([Validators.required, cepValidator()])],
      cidade: ['', Validators.compose([Validators.required])],
      bairro: ['', Validators.compose([Validators.required])],
      logradouro: ['', Validators.compose([Validators.required])],
      complemento: ['', Validators.compose([Validators.required])],
      numero: ['', Validators.compose([Validators.required])],
    });

    this.formulario.get('cep')
    .valueChanges
    .subscribe(async (cep) => {
      if (cep && cep.length == 8) {
        const dados = await getCEPData(cep);
        if (dados && dados.uf) {
          let formData = {
            estado: dados.uf,
            cidade: dados.localidade,
            bairro: dados.bairro,
            logradouro: dados.logradouro,
            complemento: dados.complemento
          };
          this.formulario.patchValue(formData, {emitEvent: true});
          if (dados.localidade){
            this.formulario.controls.cidade.disable();
          }
          else {
            this.formulario.controls.cidade.enable();
          }

          if (dados.bairro){
            this.formulario.controls.bairro.disable();
          }
          else {
            this.formulario.controls.bairro.enable();
          }

          if (dados.logradouro){
            this.formulario.controls.logradouro.disable();
          }
          else {
            this.formulario.controls.logradouro.enable();
          }

          if (dados.complemento){
            this.formulario.controls.complemento.disable();
          }
          else {
            this.formulario.controls.complemento.enable();
          }
          this.formulario.controls.numero.enable();
        }
        else {
          let formData = {
            estado: "",
            cidade: "",
            bairro: "",
            logradouro: "",
            complemento: "",
            numero: ""
          };
          this.formulario.patchValue(formData, {emitEvent: true});
          this.formulario.controls.cidade.disable();
          this.formulario.controls.bairro.disable();
          this.formulario.controls.logradouro.disable();
          this.formulario.controls.complemento.disable();
          this.formulario.controls.numero.disable();
        }
      }
      else {
        let formData = {
          estado: "",
          cidade: "",
          bairro: "",
          logradouro: "",
          complemento: "",
          numero: ""
        };
        this.formulario.patchValue(formData, {emitEvent: true});
        this.formulario.controls.cidade.disable();
        this.formulario.controls.bairro.disable();
        this.formulario.controls.logradouro.disable();
        this.formulario.controls.complemento.disable();
        this.formulario.controls.numero.disable();
      }
    }
    );
  }

  async ngOnInit() {
    let dado = {
      nome: "",
      sobrenome: "",
      cpf: "",
      genero: "Não Informado",
      outroGenero: "",
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      logradouro: "",
      complemento: "",
      numero: ""
    };

    this.formulario.patchValue(dado, {emitEvent: true});
    this.formulario.controls.cidade.disable();
    this.formulario.controls.bairro.disable();
    this.formulario.controls.logradouro.disable();
    this.formulario.controls.complemento.disable();
    this.formulario.controls.numero.disable();
  }

  async enviar() {
    if (this.formulario.value.genero == 'Informar Outro') {
      this.formulario.value.genero = this.formulario.value.outroGenero;
    }
    
    if (!this.formulario.valid) {
        this.formulario.markAllAsTouched();
    }
    else {
      console.log(this.formulario.getRawValue());
    }
  }

}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let cpf = control.value;
    if (!cpf) {
      return null;
    }
    return validateCPF(cpf) ? null : {cpfInvalido: true};
  };
}

export function requiredOutroGeneroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let genero = control.parent?.get('genero')?.value;
    let outroGenero = control.value;

    if (genero === 'Informar Outro' && !outroGenero) {
      return {requiredOutro: true};
    }
    return null;
  };
}

export function cepLengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.length != 8) {
      return {cepLengthInvalido: true};
    }
  };
}

export function cepValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let cep = control.parent?.get('cep')?.value;
    let estado = control.value;
    if (cep && cep.length == 8 && !estado) {
      return {cepInvalido: true};
    }
    return null;
  };
}


function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if(cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  var result = true;
  [9,10].forEach(function(j){
      var soma = 0, r;
      cpf.split(/(?=)/).splice(0,j).forEach(function(e, i){
          soma += parseInt(e) * ((j+2)-(i+1));
      });
      r = soma % 11;
      r = (r <2)?0:11-r;
      if(r != cpf.substring(j, j+1)) result = false;
  });
  return result;
}

async function getCEPData(cep: string): Promise<any> {
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const response = await fetch(url).then(res => res.json());
  return response;
} 
