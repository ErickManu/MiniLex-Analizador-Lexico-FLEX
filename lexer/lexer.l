%option noyywrap
%option yylineno

%{
#include <stdio.h>

void token(const char *tipo)
{
    printf("%s\t%s\t%d\n", tipo, yytext, yylineno);
}
%}

%%

"int"|"float"|"string"|"bool" {
    token("PALABRA_RESERVADA");
}

"if"|"else"|"while"|"return"|"print" {
    token("PALABRA_RESERVADA");
}

"true"|"false" {
    token("BOOLEANO");
}

[0-9]+\.[0-9]+ {
    token("DECIMAL");
}

[0-9]+ {
    token("ENTERO");
}

\"([^\\\n\"]|\\.)*\" {
    token("CADENA");
}

[a-zA-Z_][a-zA-Z0-9_]* {
    token("IDENTIFICADOR");
}

">=" {
    token("MAYOR_IGUAL");
}

"<=" {
    token("MENOR_IGUAL");
}

"==" {
    token("IGUALDAD");
}

"!=" {
    token("DIFERENTE");
}

">" {
    token("MAYOR_QUE");
}

"<" {
    token("MENOR_QUE");
}

"=" {
    token("ASIGNACION");
}

"&&" {
    token("AND");
}

"||" {
    token("OR");
}

"!" {
    token("NOT");
}

"+" {
    token("SUMA");
}

"-" {
    token("RESTA");
}

"*" {
    token("MULTIPLICACION");
}

"/" {
    token("DIVISION");
}

"%" {
    token("MODULO");
}

"(" {
    token("PARENTESIS_IZQUIERDO");
}

")" {
    token("PARENTESIS_DERECHO");
}

"{" {
    token("LLAVE_IZQUIERDA");
}

"}" {
    token("LLAVE_DERECHA");
}

"[" {
    token("CORCHETE_IZQUIERDO");
}

"]" {
    token("CORCHETE_DERECHO");
}

";" {
    token("PUNTO_COMA");
}

"," {
    token("COMA");
}

"//"[^\r\n]* {
    /* Ignorar comentario */
}

[ \t\r]+ {
    /* Ignorar espacios */
}

\n {
    /* yylineno se actualiza automáticamente */
}

. {
    token("ERROR");
}

%%

int main(void)
{
    yylex();
    return 0;
}