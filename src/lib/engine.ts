import type {
  FinderCriteria,
  MatchResult,
  Software,
} from '../types/software';

export interface AuditResult {
  result: MatchResult;
  reasons: string[];
}

export function evaluateSoftware(
  software: Software,
  criteria: FinderCriteria,
): AuditResult {
  const reasons: string[] = [];

  // 1. Categoria
  if (software.category !== criteria.category) {
    reasons.push(
      `Categoria incompatível: o software pertence a "${software.category}".`,
    );

    return {
      result: 'MISMATCH',
      reasons,
    };
  }

  // 2. Dimensão da empresa
  if (!software.targetCompanySize.includes(criteria.companySize)) {
    reasons.push(
      `Não está indicado suporte para empresas do tipo "${criteria.companySize}".`,
    );

    return {
      result: 'MISMATCH',
      reasons,
    };
  }

  // 3. Objetivo
  if (!software.primaryGoals.includes(criteria.goal)) {
    reasons.push(
      `O objetivo "${criteria.goal}" não está entre os objetivos verificados da ferramenta.`,
    );

    return {
      result: 'MISMATCH',
      reasons,
    };
  }

  // 4. Orçamento
  if (criteria.maxBudget !== undefined) {
    const price = software.pricing.startingPrice;

    // Não sabemos o preço → não inventamos
    if (price === undefined) {
      reasons.push(
        'Não existe preço inicial verificado suficiente para avaliar o orçamento.',
      );

      return {
        result: 'UNKNOWN',
        reasons,
      };
    }

    // Preço acima do orçamento
    if (price > criteria.maxBudget) {
      reasons.push(
        `O preço inicial verificado (${software.pricing.currency} ${price}) ultrapassa o orçamento definido.`,
      );

      return {
        result: 'MISMATCH',
        reasons,
      };
    }
  }

  // 5. Todos os critérios conhecidos são compatíveis
  reasons.push(
    'Os critérios fornecidos são compatíveis com os dados atualmente verificados.',
  );

  return {
    result: 'MATCH',
    reasons,
  };
}