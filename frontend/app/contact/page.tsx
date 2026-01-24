'use client'

import { useState } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📧 Contact Us</h1>
      <p className="text-secondary">We'd love to hear from you!</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          
          {submitted ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-800">✅ Thank you! Your message has been sent. We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <select required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Select a subject</option>
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership Opportunity</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea required rows={5} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"></textarea>
              </div>

              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📍 Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-gray-600">support@fairhire-sentinel.com</div>
              </div>
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-gray-600">+1 (555) 123-4567</div>
              </div>
              <div>
                <div className="font-semibold">Address</div>
                <div className="text-gray-600">123 Tech Street<br />San Francisco, CA 94102<br />United States</div>
              </div>
              <div>
                <div className="font-semibold">Business Hours</div>
                <div className="text-gray-600">Monday - Friday<br />9:00 AM - 6:00 PM PST</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">🔗 Connect With Us</h3>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                LinkedIn
              </button>
              <button className="flex-1 bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 text-sm">
                Twitter
              </button>
              <button className="flex-1 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm">
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">❓ Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FAQItem 
            question="How does Fair-Hire Sentinel work?"
            answer="Fair-Hire Sentinel uses AI and semantic analysis to monitor ATS systems for bias patterns in real-time."
          />
          <FAQItem 
            question="Is my data secure?"
            answer="Yes, we use enterprise-grade encryption and comply with GDPR, CCPA, and other data protection regulations."
          />
          <FAQItem 
            question="Can I integrate this with my existing ATS?"
            answer="Yes! We offer integrations with major ATS platforms including Workday, Greenhouse, Lever, and more."
          />
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer font-semibold p-3 bg-gray-50 rounded hover:bg-gray-100">
        {question}
      </summary>
      <p className="p-3 text-gray-700">{answer}</p>
    </details>
  )
}
