import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Plus, Trash2, Code, Edit3 } from "lucide-react";

interface Field {
  key: string;
  type: "String" | "Number" | "Nested";
  children: Field[];
}

const defaultField = (): Field => ({ key: "", type: "String", children: [] });

const getDefaultValue = (type: Field["type"]): string | number | Record<string, unknown> => {
  switch (type) {
    case "String":
      return "";
    case "Number":
      return 0;
    case "Nested":
      return {};
    default:
      return "";
  }
};

const generateSchema = (fields: Field[]): Record<string, string | number | object> => {
  const schema: Record<string, string | number | object> = {};
  fields.forEach(({ key, type, children }) => {
    if (!key) return;
    if (type === "Nested") {
      schema[key] = generateSchema(children);
    } else {
      schema[key] = getDefaultValue(type);
    }
  });
  return schema;
};

interface FieldEditorProps {
  fields: Field[];
  setFields: (fields: Field[]) => void;
  depth?: number;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ fields, setFields, depth = 0 }) => {
  const updateField = (index: number, updated: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updated };
    setFields(newFields);
  };

  const addField = () => setFields([...fields, defaultField()]);

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const updateChildren = (index: number, children: Field[]) => {
    const newFields = [...fields];
    newFields[index].children = children;
    setFields(newFields);
  };

  const getTypeColor = (type: Field["type"]) => {
    switch (type) {
      case "String":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Number":
        return "bg-sky-50 text-sky-800 border-sky-300";
      case "Nested":
        return "bg-rose-50 text-rose-800 border-rose-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm ${
          depth > 0 ? 'bg-gradient-to-r from-gray-50 to-white' : 'bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Field name..."
                  value={field.key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(index, { key: e.target.value })}
                  className="h-12 text-base font-medium border-2 border-slate-200 focus:border-slate-600 rounded-xl transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={field.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField(index, { type: e.target.value as Field["type"] })}
                  className={`h-12 px-4 pr-10 text-base font-semibold rounded-xl border-2 cursor-pointer transition-all appearance-none ${getTypeColor(field.type)} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
                >
                  <option value="String">String</option>
                  <option value="Number">Number</option>
                  <option value="Nested">Nested</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => removeField(index)}
                className="h-12 w-12 rounded-xl border-2 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-800 transition-all duration-200 group-hover:scale-105"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            
            {field.type === "Nested" && (
              <div className="mt-6 pl-6 border-l-4 border-rose-300 bg-gradient-to-r from-rose-50 to-transparent">
                <div className="mb-4 flex items-center gap-2 text-rose-800">
                  <div className="h-2 w-2 rounded-full bg-rose-400"></div>
                  <span className="text-sm font-medium">Nested fields</span>
                </div>
                <FieldEditor
                  fields={field.children}
                  setFields={(newChildren) => updateChildren(index, newChildren)}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        </Card>
      ))}
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={addField} 
          className="h-12 px-8 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Field
        </Button>
      </div>
    </div>
  );
};

const JsonSchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const schema = generateSchema(fields);
  const hasFields = fields.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-100 to-slate-100 py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-slate-700 rounded-xl flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              JSON Schema Builder
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Create and visualize JSON schemas with an intuitive drag-and-drop interface
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 backdrop-blur-sm rounded-2xl p-1 h-14">
              <TabsTrigger 
                value="editor" 
                className="flex items-center gap-2 h-12 text-base font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Edit3 className="h-5 w-5" />
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="json" 
                className="flex items-center gap-2 h-12 text-base font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Code className="h-5 w-5" />
                JSON Output
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {!hasFields && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                    <Plus className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No fields yet</h3>
                  <p className="text-slate-500 mb-8">Start building your JSON schema by adding your first field</p>
                </div>
              )}
              <FieldEditor fields={fields} setFields={setFields} />
            </TabsContent>

            <TabsContent value="json">
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-8 rounded-2xl overflow-x-auto shadow-inner border border-slate-600">
                  {hasFields ? (
                    <pre className="text-sm leading-relaxed">
                      <code>{JSON.stringify(schema, null, 2)}</code>
                    </pre>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Your JSON schema will appear here</p>
                      <p className="text-sm mt-2">Add some fields to see the generated output</p>
                    </div>
                  )}
                </div>
                {hasFields && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Valid JSON
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default JsonSchemaBuilder;