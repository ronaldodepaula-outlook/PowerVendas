import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Bateria } from '../services/baterias.service';
import { type Categoria, listCategorias } from '../services/categorias.service';
import { type Grupo, listGruposByCategoria } from '../services/grupos.service';
import { type Subgrupo, listSubgruposByGrupo } from '../services/subgrupos.service';

interface BateriaFormProps {
  bateria?: Bateria | null;
  onSubmit: (data: Partial<Bateria>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BateriaForm: React.FC<BateriaFormProps> = ({
  bateria,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Bateria>>({
    codigo: '',
    modelo: '',
    amperagem: 0,
    garantia_meses: 0,
    preco_venda: 0,
    preco_custo: 0,
    id_categoria: 0,
    id_grupo: 0,
    id_subgrupo: 0,
    ativo: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);

  // Refs para rastrear qual categoria/grupo foi carregado
  const loadedCategoryRef = useRef<number | null>(null);
  const loadedGroupRef = useRef<number | null>(null);
  const categoriesLoadedRef = useRef(false);

  // Memoized load functions
  const loadCategorias = useCallback(async () => {
    if (categoriesLoadedRef.current) return;
    try {
      setLoadingDrops(true);
      const data = await listCategorias();
      setCategorias(data);
      categoriesLoadedRef.current = true;
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoadingDrops(false);
    }
  }, []);

  const loadGrupos = useCallback(async (idCategoria: number) => {
    if (loadedCategoryRef.current === idCategoria) return;
    try {
      setLoadingDrops(true);
      const data = await listGruposByCategoria(idCategoria);
      setGrupos(data);
      loadedCategoryRef.current = idCategoria;
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      setGrupos([]);
    } finally {
      setLoadingDrops(false);
    }
  }, []);

  const loadSubgrupos = useCallback(async (idGrupo: number) => {
    if (loadedGroupRef.current === idGrupo) return;
    try {
      setLoadingDrops(true);
      const data = await listSubgruposByGrupo(idGrupo);
      setSubgrupos(data);
      loadedGroupRef.current = idGrupo;
    } catch (err) {
      console.error('Erro ao carregar subgrupos:', err);
      setSubgrupos([]);
    } finally {
      setLoadingDrops(false);
    }
  }, []);

  // Load initial data and dropdowns (only once)
  useEffect(() => {
    loadCategorias();
    if (bateria) {
      setFormData(bateria);
      // Se editando, carrega grupos da categoria
      if (bateria.id_categoria && bateria.id_categoria > 0) {
        loadGrupos(bateria.id_categoria);
        // Se tem grupo, carrega subgrupos
        if (bateria.id_grupo && bateria.id_grupo > 0) {
          loadSubgrupos(bateria.id_grupo);
        }
      }
    }
  }, [bateria, loadCategorias, loadGrupos, loadSubgrupos]);

  // Load grupos when category changes (only if different from last loaded)
  useEffect(() => {
    if (formData.id_categoria && formData.id_categoria > 0 && loadedCategoryRef.current !== formData.id_categoria) {
      loadGrupos(formData.id_categoria);
      // Reset subgrupo quando categoria muda
      setSubgrupos([]);
      setFormData((p) => ({ ...p, id_subgrupo: 0 }));
    } else if (!formData.id_categoria || formData.id_categoria <= 0) {
      setGrupos([]);
      setSubgrupos([]);
    }
  }, [formData.id_categoria, loadGrupos]);

  // Load subgrupos when grupo changes (only if different from last loaded)
  useEffect(() => {
    if (formData.id_grupo && formData.id_grupo > 0 && loadedGroupRef.current !== formData.id_grupo) {
      loadSubgrupos(formData.id_grupo);
    } else if (!formData.id_grupo || formData.id_grupo <= 0) {
      setSubgrupos([]);
    }
  }, [formData.id_grupo, loadSubgrupos]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Código - obrigatório, mínimo 2 caracteres
    if (!formData.codigo?.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    } else if (formData.codigo.trim().length < 2) {
      newErrors.codigo = 'Código deve ter no mínimo 2 caracteres';
    }

    // Modelo - obrigatório, mínimo 3 caracteres
    if (!formData.modelo?.trim()) {
      newErrors.modelo = 'Modelo é obrigatório';
    } else if (formData.modelo.trim().length < 3) {
      newErrors.modelo = 'Modelo deve ter no mínimo 3 caracteres';
    }

    // Amperagem - obrigatório, deve ser maior que 0
    if (!formData.amperagem || formData.amperagem <= 0) {
      newErrors.amperagem = 'Amperagem deve ser maior que 0';
    } else if (!Number.isInteger(formData.amperagem)) {
      newErrors.amperagem = 'Amperagem deve ser um número inteiro';
    }

    // Garantia - obrigatório, deve ser >= 0
    if (formData.garantia_meses === undefined || formData.garantia_meses === null) {
      newErrors.garantia_meses = 'Garantia é obrigatória';
    } else if (formData.garantia_meses < 0) {
      newErrors.garantia_meses = 'Garantia não pode ser negativa';
    } else if (!Number.isInteger(formData.garantia_meses)) {
      newErrors.garantia_meses = 'Garantia deve ser um número inteiro';
    }

    // Preço de Venda - obrigatório, deve ser maior que 0
    if (!formData.preco_venda || formData.preco_venda <= 0) {
      newErrors.preco_venda = 'Preço de venda deve ser maior que 0';
    }

    // Preço de Custo - obrigatório, deve ser >= 0
    if (formData.preco_custo === undefined || formData.preco_custo === null) {
      newErrors.preco_custo = 'Preço de custo é obrigatório';
    } else if (formData.preco_custo < 0) {
      newErrors.preco_custo = 'Preço de custo não pode ser negativo';
    }

    // Validar que preço de venda é maior que custo
    if (formData.preco_venda && formData.preco_custo && formData.preco_venda <= formData.preco_custo) {
      newErrors.preco_venda = 'Preço de venda deve ser maior que o preço de custo';
    }

    // Categoria - obrigatório
    if (!formData.id_categoria || formData.id_categoria <= 0) {
      newErrors.id_categoria = 'Categoria é obrigatória';
    }

    // Grupo - obrigatório
    if (!formData.id_grupo || formData.id_grupo <= 0) {
      newErrors.id_grupo = 'Grupo é obrigatório';
    }

    // Subgrupo - obrigatório
    if (!formData.id_subgrupo || formData.id_subgrupo <= 0) {
      newErrors.id_subgrupo = 'Subgrupo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Conversão de tipos para campos numéricos
    let finalValue: string | number = value;
    if (['amperagem', 'garantia_meses', 'id_categoria', 'id_grupo', 'id_subgrupo', 'ativo'].includes(name)) {
      finalValue = value === '' ? '' : parseInt(value, 10);
    } else if (['preco_venda', 'preco_custo'].includes(name)) {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const margem = formData.preco_venda && formData.preco_custo 
    ? (((formData.preco_venda - formData.preco_custo) / formData.preco_custo) * 100).toFixed(2)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Código */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Código *
        </label>
        <input
          type="text"
          name="codigo"
          value={formData.codigo || ''}
          onChange={handleChange}
          placeholder="Ex: B60, B100, B200"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.codigo
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.codigo && <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>}
      </div>

      {/* Modelo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Modelo *
        </label>
        <input
          type="text"
          name="modelo"
          value={formData.modelo || ''}
          onChange={handleChange}
          placeholder="Ex: Moura 60Ah, Helpcar 100Ah"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.modelo
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>}
      </div>

      {/* Amperagem */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Amperagem (Ah) *
        </label>
        <input
          type="number"
          name="amperagem"
          value={formData.amperagem || ''}
          onChange={handleChange}
          placeholder="Ex: 60, 100, 200"
          min="1"
          step="1"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.amperagem
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.amperagem && <p className="text-red-500 text-sm mt-1">{errors.amperagem}</p>}
      </div>

      {/* Garantia */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Garantia (Meses) *
        </label>
        <input
          type="number"
          name="garantia_meses"
          value={formData.garantia_meses || ''}
          onChange={handleChange}
          placeholder="Ex: 12, 18, 24"
          min="0"
          step="1"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.garantia_meses
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.garantia_meses && <p className="text-red-500 text-sm mt-1">{errors.garantia_meses}</p>}
      </div>

      {/* Preços */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Preço de Custo (R$) *
          </label>
          <input
            type="number"
            name="preco_custo"
            value={formData.preco_custo || ''}
            onChange={handleChange}
            placeholder="Ex: 300.00"
            min="0"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.preco_custo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.preco_custo && <p className="text-red-500 text-sm mt-1">{errors.preco_custo}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Preço de Venda (R$) *
          </label>
          <input
            type="number"
            name="preco_venda"
            value={formData.preco_venda || ''}
            onChange={handleChange}
            placeholder="Ex: 480.00"
            min="0.01"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.preco_venda
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.preco_venda && <p className="text-red-500 text-sm mt-1">{errors.preco_venda}</p>}
        </div>
      </div>

      {/* Margem (informativo) */}
      {formData.preco_venda && formData.preco_custo && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Margem de Lucro: </span>
            {margem}%
          </p>
        </div>
      )}

      {/* Categoria */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Categoria *
        </label>
        <select
          name="id_categoria"
          value={formData.id_categoria || ''}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.id_categoria
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting || loadingDrops}
        >
          <option value="">-- Selecione uma categoria --</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id || ''}>
              {cat.nome}
            </option>
          ))}
        </select>
        {errors.id_categoria && <p className="text-red-500 text-sm mt-1">{errors.id_categoria}</p>}
      </div>

      {/* Grupo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Grupo *
        </label>
        <select
          name="id_grupo"
          value={formData.id_grupo || ''}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.id_grupo
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting || loadingDrops || !formData.id_categoria || formData.id_categoria <= 0}
        >
          <option value="">-- Selecione um grupo --</option>
          {grupos.map((grp) => (
            <option key={grp.id} value={grp.id || ''}>
              {grp.nome}
            </option>
          ))}
        </select>
        {errors.id_grupo && <p className="text-red-500 text-sm mt-1">{errors.id_grupo}</p>}
        {formData.id_categoria && formData.id_categoria > 0 && grupos.length === 0 && !loadingDrops && (
          <p className="text-yellow-600 text-sm mt-1">Nenhum grupo encontrado para esta categoria</p>
        )}
      </div>

      {/* Subgrupo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Subgrupo *
        </label>
        <select
          name="id_subgrupo"
          value={formData.id_subgrupo || ''}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.id_subgrupo
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting || loadingDrops || !formData.id_grupo || formData.id_grupo <= 0}
        >
          <option value="">-- Selecione um subgrupo --</option>
          {subgrupos.map((sub) => (
            <option key={sub.id} value={sub.id || ''}>
              {sub.nome}
            </option>
          ))}
        </select>
        {errors.id_subgrupo && <p className="text-red-500 text-sm mt-1">{errors.id_subgrupo}</p>}
        {formData.id_grupo && formData.id_grupo > 0 && subgrupos.length === 0 && !loadingDrops && (
          <p className="text-yellow-600 text-sm mt-1">Nenhum subgrupo encontrado para este grupo</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Status
        </label>
        <select
          name="ativo"
          value={formData.ativo || 1}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? 'Salvando...' : bateria ? 'Atualizar' : 'Criar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default BateriaForm;
