import { NextResponse } from 'next/server'
import { validateDocument, detectDocumentType, sanitizeDocument, validatePhone } from '@/lib/validators'
import { sendWelcomeEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, document, phone, rg, address, addressNumber, addressComplement, neighborhood, city, state, zipCode } = body

    console.log('Registration attempt:', { name, email, document, phone, password: password ? '[PROVIDED]' : '[MISSING]' })

    // Validate required fields
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!email) missingFields.push('email')
    if (!password) missingFields.push('password')
    if (!document) missingFields.push('document')

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 4) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 4 caracteres' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validate document
    if (!validateDocument(document)) {
      return NextResponse.json(
        { error: 'CPF ou CNPJ inválido' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const cleanDocument = sanitizeDocument(document)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })
    const existingUserByDocument = await prisma.user.findFirst({
      where: {
        OR: [
          { cpf: cleanDocument },
          { cnpj: cleanDocument }
        ]
      }
    })
    
    const documentType = detectDocumentType(document)

    if (existingUserByEmail) {
      // Log duplicate email attempt
      await prisma.auditLog.create({
        data: {
          action: 'REGISTER_FAILED',
          resource: 'USER',
          metadata: { email, reason: 'email_already_exists' }
        }
      })
      
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    if (existingUserByDocument) {
      // Log duplicate document attempt
      await prisma.auditLog.create({
        data: {
          action: 'REGISTER_FAILED',
          resource: 'USER',
          metadata: { document: cleanDocument, reason: 'document_already_exists' }
        }
      })
      
      return NextResponse.json(
        { error: 'Documento já cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        ...(documentType === 'CPF' ? { cpf: cleanDocument } : { cnpj: cleanDocument }),
        rg: rg || null,
        address: address || null,
        addressNumber: addressNumber || null,
        addressComplement: addressComplement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        role: 'USER'
      }
    })

    // Log successful registration
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTERED',
        resource: 'USER',
        metadata: { email: newUser.email }
      }
    })

    // Send welcome email
    const welcomeEmailResult = await sendWelcomeEmail({
      to: newUser.email,
      name: newUser.name || 'Usuário'
    })

    if (welcomeEmailResult.success) {
      console.log('Welcome email sent successfully to:', newUser.email)
      
      // Log email success
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'WELCOME_EMAIL_SENT',
          resource: 'EMAIL',
          metadata: { email: newUser.email }
        }
      })
    } else {
      console.error('Failed to send welcome email:', welcomeEmailResult.error)
      
      // Log email failure
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'EMAIL_FAILED',
          resource: 'EMAIL',
          metadata: { email: newUser.email, error: welcomeEmailResult.error }
        }
      })
    }

    console.log('User registered successfully:', newUser)

    return NextResponse.json({
      message: 'Conta criada com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        cpf: newUser.cpf,
        cnpj: newUser.cnpj,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      redirect: '/auth/login?newUser=true'
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    // Log registration error
    await prisma.auditLog.create({
      data: {
        action: 'REGISTER_ERROR',
        resource: 'USER',
        metadata: { error: (error as any).message || 'Unknown error' }
      }
    })
    
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

