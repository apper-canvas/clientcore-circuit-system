import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";

const DealForm = ({ deal, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title_c: "",
    contact_id_c: "",
    value_c: "",
    stage_c: "Lead",
    probability_c: "",
    expected_close_date_c: "",
    notes_c: ""
  });

  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
if (deal) {
      setFormData({
        title_c: deal.title_c || "",
        contact_id_c: deal.contact_id_c?.Id || deal.contact_id_c || "",
        value_c: deal.value_c?.toString() || "",
        stage_c: deal.stage_c || "Lead",
        probability_c: deal.probability_c?.toString() || "",
        expected_close_date_c: deal.expected_close_date_c ? 
          new Date(deal.expected_close_date_c).toISOString().split("T")[0] : "",
        notes_c: deal.notes_c || ""
      });
    }
  }, [deal]);

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
if (!formData.title_c.trim()) {
      newErrors.title_c = "Deal title is required";
    }
    
    if (!formData.contact_id_c) {
      newErrors.contact_id_c = "Contact selection is required";
    }
    
    if (!formData.value_c.trim()) {
      newErrors.value_c = "Deal value is required";
    } else if (isNaN(formData.value_c) || parseFloat(formData.value_c) <= 0) {
      newErrors.value_c = "Deal value must be a positive number";
    }
    
    if (!formData.probability_c.trim()) {
      newErrors.probability_c = "Probability is required";
    } else if (isNaN(formData.probability_c) || parseFloat(formData.probability_c) < 0 || parseFloat(formData.probability_c) > 100) {
      newErrors.probability_c = "Probability must be between 0 and 100";
    }
    
    if (!formData.expected_close_date_c) {
      newErrors.expected_close_date_c = "Expected close date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dealData = {
...formData,
        value_c: parseFloat(formData.value_c),
        probability_c: parseInt(formData.probability_c),
        expected_close_date_c: new Date(formData.expected_close_date_c).toISOString()
      };
      onSubmit(dealData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">
          {deal ? "Edit Deal" : "Add New Deal"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ApperIcon name="X" size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Deal Title
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter deal title"
          />
          {errors.title && (
            <p className="text-error text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Contact
          </label>
          <select
            name="contactId"
            value={formData.contactId}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-md border-2 bg-surface text-primary focus:outline-none transition-colors duration-200 ${
              errors.contactId ? "border-error focus:border-error" : "border-gray-200 focus:border-accent"
            }`}
          >
            <option value="">Select a contact</option>
{contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {contact.first_name_c} {contact.last_name_c} - {contact.company_c}
              </option>
            ))}
          </select>
          {errors.contactId && (
            <p className="text-error text-sm mt-1">{errors.contactId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Deal Value ($)
            </label>
            <Input
              name="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              error={errors.value}
              placeholder="0.00"
            />
            {errors.value && (
              <p className="text-error text-sm mt-1">{errors.value}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Probability (%)
            </label>
            <Input
              name="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={handleChange}
              error={errors.probability}
              placeholder="0"
            />
            {errors.probability && (
              <p className="text-error text-sm mt-1">{errors.probability}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none transition-colors duration-200"
            >
              <option value="Lead">Lead</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Expected Close Date
            </label>
            <Input
              name="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              error={errors.expectedCloseDate}
            />
            {errors.expectedCloseDate && (
              <p className="text-error text-sm mt-1">{errors.expectedCloseDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none transition-colors duration-200 resize-none"
            placeholder="Add any additional notes about this deal..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (deal ? "Update Deal" : "Add Deal")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DealForm;