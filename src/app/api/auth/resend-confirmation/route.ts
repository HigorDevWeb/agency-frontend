import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const confirmationUrl = `${request.nextUrl.origin}/auth/confirm`;

    // Enviar requisição para o Strapi
      const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/send-email-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        confirmationUrl
      }),
    });

    if (!strapiResponse.ok) {
      const errorData = await strapiResponse.json();
      
      // Tratar diferentes tipos de erro do Strapi
      if (strapiResponse.status === 400) {
        return NextResponse.json(
          { error: errorData.error?.message || 'Email não encontrado ou já confirmado' },
          { status: 400 }
        );
      }

      throw new Error(errorData.error?.message || 'Erro no servidor do Strapi');
    }

    return NextResponse.json({
      message: 'Email de confirmação reenviado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
