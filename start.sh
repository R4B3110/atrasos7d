#!/bin/bash
# Script de inicialização para o Render

echo "🚀 Iniciando ClickUp Monitor..."
echo "📅 Horários configurados:"
echo "   - Manhã: 9h"
echo "   - Tarde: 17h"
echo ""

# Executar o scheduler
node src/automation/scheduler.js
